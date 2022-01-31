//importing the client from ipc-healthcheck
const HealthcheckClient = require('ipc-healthcheck/healthcheck-client');

//this is the name used to register at the server. The server will print out this name, then this service crashes
const serviceID = 'ExampleService';
//Turns debbug messages on or off. If set to false, the HealthcheckClient will print out log and status messages to console.
const silent = false;

//Create the client instance with the settings set above
const healthcheckclient = new HealthcheckClient(serviceID,silent);

//start listening to healthcheck calls
healthcheckclient.startListening();

//setTimeout is not required. I use it only for demonstration. This example client will shutdown after 5 secconds.
//You can simulate a crash if you interrupt this script with CTRL+C or simply by killing the process.
setTimeout( () => {
	//inform the server about the planned shutdown.
	healthcheckclient.detach();
}, 5000);
