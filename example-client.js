//importing the client from ipc-healthcheck
const HealthcheckClient = require('ipc-healthcheck/healthcheck-client');

//This is the namespace for the healthcheck services and client.
//This namespace allows clients to specify which healthcheck server they want to connect to.
//This is needed if you wanna run more then one server. 
const namespace = 'ExampleSpace';
//this is the name used to register at the server. The server will print out this name, then this service crashes
const serviceID = 'ExampleService';
//Turns debbug messages on or off. If set to false, the HealthcheckClient will print out log and status messages to console.
const silent = false;

//Create the client instance with the settings set above
const healthcheckclient = new HealthcheckClient(namespace,serviceID,silent);

//start listening to healthcheck calls
healthcheckclient.startListening();

//Example: We run into an error of some sort and want to be informed about this.
//So in case we catch an error, we notify the server about this. 
//this will trigger after 3 seconds. 
setTimeout( () => {
	try{
		//do something that might fail
		if(Math.floor(Math.random()*2) === 0)
		{
			//there is a 50:50 that this will be executed and throw an error.
			letsthrowanerror.trigger;
		}
	}
	catch(e){
		//send the error message to the server.
		healthcheckclient.notifyAboutError(e.stack);
	}
}, 3000);


//setTimeout is not required. I use it only for demonstration. This example client will shutdown after 5 secconds.
//You can simulate a crash if you interrupt this script with CTRL+C or simply by killing the process.
setTimeout( () => {
	//inform the server about the planned shutdown.
	healthcheckclient.detach();
}, 5000);
