var hue = require("node-hue-api");
var hueApi = hue.HueApi;

var hostname = "192.168.1.131",
    username = "wi-BQodpmmeKS3O-0HHfovg3qQXS8XE-9P-5TwLI",
    api= new hueApi(hostname,username);

    module.exports= {
    	hue: hue,
    	api: api
    };
