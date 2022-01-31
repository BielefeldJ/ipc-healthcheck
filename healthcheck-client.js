const ipc = require('node-ipc').default;	
  
class HealthcheckClient{
	constructor(serviceID,silent)
	{
		ipc.config.id = serviceID;
		ipc.config.retry = 3000;
		ipc.config.silent = silent;
	}
	//connecet to server and register healthcheck
	startListening()
	{	
		ipc.connectTo('watchdog', () => {
			//connect to the watchdog server and send its own ID
			ipc.of.watchdog.on('connect', () => {
				ipc.of.watchdog.emit('serviceRegister', ipc.config.id); //send socket id to the server
				ipc.log("Connected to the watchdog server and registered.");
			});
			//reply to the health check call
			ipc.of.watchdog.on('Healthcheck', () => {
				ipc.of.watchdog.emit('OK'); //respond to healthcheck call
				ipc.log("Healthcheck request received");
			});
		});	
	}
	//send a message to the watchdog server
	notifyAboutError(err)
	{
		ipc.of.watchdog.emit('notifyError', err);
		ipc.log("Send the error message to watchdog");
	}

	//Detach this service from the HealthcheckServer
	detach()
	{
		ipc.of.watchdog.emit('serviceDetach'); //Detach message to watchdog 
		ipc.disconnect('watchdog'); //close connection
		ipc.log("Detach and Disconnected from the watchdog Server.")
	}
}

module.exports = HealthcheckClient;