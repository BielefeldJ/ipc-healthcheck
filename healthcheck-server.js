const ipc = require('node-ipc').default;
const { EventEmitter } = require('events');

class HealthcheckServer extends EventEmitter 
{
	constructor(namespace, respondTime, intervall, silent) 
	{
		super();
		if (respondTime > intervall) 
			 throw new Error("respondTime can't be greater then the check intervall!!");
		
		this.intervall = intervall;
		this.respondTime = respondTime;

		ipc.config.appspace = namespace + '.';
		ipc.config.id = 'watchdog'; //If you change this name, remember to change it in the client as well.
		ipc.config.silent = silent;

		this.services = [];
		this.initiated = true;
		EventEmitter.call(this);
	}

	startServer()
	{
		//some checks before we start the Server
		if (this.running)
			throw new Error("HealthcheckServer is already running!");

		ipc.serve(() => {
			//register a new service
			ipc.server.on('serviceRegister', (message, socket) => {
				ipc.log('New client introduced as ' + message);
				socket.id = Date.now().toString(36) + (Math.random() + 1).toString(36).substring(7);; //save a "random" client's socket id. Just so we don't get any duplicates
				this.services.push(new Service(socket.id, message, socket));
				this.emit('serviceRegistered', {name : message, id : socket.id});
			});
			ipc.server.on('OK', (message, socket) => { //ignore message. We never send one anyway
				this.services.find(s => s.id === socket.id).lastcheck = Date.now();
				ipc.log(`Got healthcheck reply from socket ${socket.id}`);
			});
			ipc.server.on('serviceDetach', (message, socket) => {
				let service = this.services.find(s => s.id === socket.id);
				service.detach = true;
				ipc.log(`Service with socket id ${socket.id} detatched.`);				
				this.emit('serviceDetached', {name : service.name, id : service.id, lastrespond : service.lastcheck});
			});
			ipc.server.on('notify', (msg,socket) =>{
				let service = this.services.find(s => s.id === socket.id);
				ipc.log(`Service ${service.name} notifyed me.`);
				this.emit('serviceNotify',msg,{name : service.name, id : service.id, lastrespond : service.lastcheck});
			});
			ipc.server.on('socket.disconnected', (socket, destroyedSocketID) => {
				let disconnectedService = this.services.find(s => s.id === destroyedSocketID);
				if (disconnectedService.detach) {
					this.services.splice(this.services.indexOf(disconnectedService), 1);
					ipc.log('Service ' + disconnectedService.name + ' detached and disconnected.')
				}
				else
					ipc.log('Client ' + disconnectedService.name + ' has disconnected without detaching!');
			});
		});

		ipc.server.start(); //start the IPC server

		//the check funktions calles every service to see if its still online.
		///To do so, it takes the current time, calls the service and compares the time before the call, with the time from the service class. This time will be updated on the client answer 
		this.healtcheckInterval = setInterval(() => {
			this.services.forEach((service, index) => {
				const time = Date.now(); //take the curret time					
				ipc.server.emit(service.socket, 'Healthcheck'); //call the service. If the service is alive, it should answer this call and the ipc function 'OK' will be triggered.				
				setTimeout(() => {
					if (service.lastcheck < time) {
						//if the time before the check is greater then the lastceck time of the service, the service did not answer Healthcheck call and might be crashed.
						ipc.log(`${service.name} did not answer the Healthcheck call. `);
						if (service.crashed) //service did't respond 3 times in a row. 
						{
							ipc.log(`${service.name} did not answer 3 times in a row. Removing it from list now`);
							this.emit('serviceCrashed', {name : service.name, id : service.id, lastrespond : service.lastcheck});
							this.services.splice(index, 1); //removing the service, no need to checked a crashed service anymore no?
						}
					}
				}, this.respondTime); //respondTime lets give the client some time to answer. (in ms)
			});
		}, this.intervall); //execute the check every X ms
		this.running = true;
	}

	//This function clears the Check intervall and stops the IPC server.
	stopServer(){
		if (!this.running)
			throw new Error("HealthcheckServer already running!");
		clearInterval(this.healtcheckInterval);
		ipc.server.stop();
		this.running = false;
	}
}

//class to handle service objects used by the server
class Service 
{
	constructor(id, name, socket)
	{
		this.id = id;
		this.name = name;
		this.socket = socket;
		this.maxRetries = 3;
		this.detach = false;
	}
	
	set lastcheck(check){
		this.maxRetries = 3; //resets the retries as well. Because it's alive :)
		this.lastchecktime = check;
	}
	get lastcheck(){return this.lastchecktime;}
	
	//give the client 3 tries before it's considered as crashed. 
	get crashed(){ 
		this.maxRetries--;
		return !(this.maxRetries>0)
	}
}

module.exports = HealthcheckServer;