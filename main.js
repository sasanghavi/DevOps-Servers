var needle = require("needle");
var os   = require("os");

var config = {};
config.token = "e7913305cc6a38cdb7c468848966005f4bf68dee15cc515b7673963b006f15cb";

var headers =
{
	'Content-Type':'application/json',
	Authorization: 'Bearer ' + config.token
};

// Documentation for needle:
// https://github.com/tomas/needle

var client =
{
	listRegions: function( onResponse )
	{
		needle.get("https://api.digitalocean.com/v2/regions", {headers:headers}, onResponse)
	},
	listImages: function( onResponse )
	{
		needle.get("https://api.digitalocean.com/v2/images", {headers:headers}, onResponse)
	},


	listSshDetails: function( onResponse )
	{
		needle.get("https://api.digitalocean.com/v2/account/keys", {headers:headers}, onResponse)
	},

		createDroplet: function (dropletName, region, imageName, onResponse)
		{
			var data =
			{
				"name": dropletName,
				"region":region,
				"size":"512mb",
				"image":imageName,
				// Id to ssh_key already associated with account.
				"ssh_keys":[3409267],
				//"ssh_keys":null,
				"backups":false,
				"ipv6":false,
				"user_data":null,
				"private_networking":null,
				"volumes":null
			};

			// console.log("Attempting to create: "+ JSON.stringify(data) );

			needle.post("https://api.digitalocean.com/v2/droplets", data, {headers:headers,json:true}, onResponse );
		},
	retrieve: function(dropletId, onResponse )
	{
		needle.get("https://api.digitalocean.com/v2/droplets/"+dropletId, {headers:headers}, onResponse);
	}
	};
	delete: function(dropletId, onResponse )
	{
		needle.delete("https://api.digitalocean.com/v2/droplets/"+dropletId, null, {headers:headers}, onResponse);
	}
};


// #############################################
// #1 Print out a list of available regions
// Comment out when completed.
// https://developers.digitalocean.com/documentation/v2/#list-all-regions
// use 'slug' property
client.listRegions(function(error, response)
{
	var data = response.body;
	//console.log( JSON.stringify(response.body) );

	if( response.headers )
	{
		console.log( "Calls remaining", response.headers["ratelimit-remaining"] );
	}

	if( data.regions )
	{
		for(var i=0; i<data.regions.length; i++)
		{
			console.log(data.regions[i].slug)
		}
	}
});


// #############################################
// #2 Extend the client object to have a listImages method
// Comment out when completed.
// https://developers.digitalocean.com/documentation/v2/#images
// - Print out a list of available system images, that are AVAILABLE in a specified region.
// - use 'slug' property
client.listImages(function(error, response)
{
	var data = response.body;
	//console.log( JSON.stringify(response.body) );

	if( response.headers )
	{
		console.log( "Calls remaining", response.headers["ratelimit-remaining"] );
		console.log("Status code: ", response.headers["status"]);
	}

	if( data.images )
	{
		for(var i=0; i<data.images.length; i++)
		{
			console.log("Available image: \n", data.images[i].slug)
		}
	}
});

client.listSshDetails(function(error, response)
{
	var data = response.body;
	console.log( JSON.stringify(response.body) );

	if( response.headers )
	{
		console.log( "Calls remaining", response.headers["ratelimit-remaining"] );
		console.log("Status code: ", response.headers["status"]);
	}

	if( data.ssh_keys )
	{
		for(var i=0; i<data.ssh_keys.length; i++)
		{
			console.log("Available key: \n", data.ssh_keys[i].id)
		}
	}
});


// #############################################
// #3 Create an droplet with the specified name, region, and image
// Comment out when completed. ONLY RUN ONCE!!!!!
// Write down/copy droplet id.
var name = "ssangha"+os.hostname();
var region = "sgp1"; // Fill one in from #1
var image = "debian-7-x32"; // Fill one in from #2
client.createDroplet(name, region, image, function(error, response, body)
{
	//console.log(body);
	console.log( "Calls remaining", response.headers["ratelimit-remaining"] );
	console.log("Status code: ", response.headers["status"]);

	// StatusCode 202 - Means server accepted request.
	if(!error && response.statusCode == 202)
	{
		console.log( JSON.stringify( body, null, 5 ) );
	}
});

// #############################################
// #4 Extend the client to retrieve information about a specified droplet.
// Comment out when done.
// https://developers.digitalocean.com/documentation/v2/#retrieve-an-existing-droplet-by-id
// REMEMBER POST != GET
// Most importantly, print out IP address!
var dropletId = "25571465";
client.retrieve(dropletId, function(error, response)
{
	var data = response.body;
	if( response.headers )
	{
		console.log( "Calls remaining", response.headers["ratelimit-remaining"] );
		console.log("Status code: ", response.headers["status"]);
	}

	if( data.droplet )
	{
			console.log("Available droplet ip address details: \n", data.droplet.networks.v4[0].ip_address);
	}
});

// #############################################
// #5 In the command line, ping your server, make sure it is alive!
ping 188.166.223.77

// #############################################
// #6 Extend the client to DESTROY the specified droplet.
// Comment out when done.
// https://developers.digitalocean.com/documentation/v2/#delete-a-droplet
// HINT, use the DELETE verb.
// HINT #2, needle.delete(url, data, options, callback), data needs passed as null.
// No response body will be sent back, but the response code will indicate success.
// Specifically, the response code will be a 204, which means that the action was successful with no returned body data.
// 	if(!err && resp.statusCode == 204)
// 	{
//			console.log("Deleted!");
// 	}
client.delete(dropletId, function(error, response)
{
	// console.log("response : ", response);

	if( response.headers )
	{
		console.log( "Calls remaining", response.headers["ratelimit-remaining"] );
		console.log("Status code: ", response.headers["status"]);
	}
	if(!error && response.statusCode == 204)
	{
		console.log("Deleted!");
	}
});
// #############################################
// #7 In the command line, ping your server, make sure it is dead!
ping 188.166.223.77
// It could be possible that digitalocean reallocated your IP address to another server, so don't fret it is still pinging.
