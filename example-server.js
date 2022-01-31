
//importing the HealthcheckServer.
const HealthcheckServer = require('ipc-healthcheck/healthcheck-server');


//Time the server waits before checking for a response from the client. Time in ms.
const respondTime = 100;
//Time the server waits between checks. Time in ms. The intervalTime should always be greater than respondTime
const intervalTime = 1000
//Turns debbug messages on or off. If set to false, the HealthcheckServer will print out log and status messages to console.
const silent = true;

//Create the HealthcheckServer with the given settings.
const healthcheckserver = new HealthcheckServer(respondTime,intervalTime ,silent);

//this event will trigger, as soon as a service did not respond 3 times in a row. 
healthcheckserver.on('serviceCrashed', (name) => {
	console.log('Service crashed: ' + name);
});

//this event will trigger, as soon as a service calls the notifyAboutError method.
//This way, the service can send a message to the server.
//An example would be, if the service in question throws an error and you want to be informed about it.
//in this case you can call the notifyAboutError method client side and this event will trigger here
healthcheckserver.on('serviceError', (errmeg,service) => {
	console.log(`Service ${service.name} with id ${service.id} send the following error: ${errmeg}`);
});

//Starts the HealthcheckServer
healthcheckserver.startServer();

process.on('SIGINT', () => {
	//Stops the HealthcheckServer Server.
	healthcheckserver.stopServer();
	console.info('Shutdown example Server.');
  });

