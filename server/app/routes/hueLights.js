var router = require('express').Router();
var hueApi= require('../configure/hue-config');
var hue= hueApi.hue;
var api= hueApi.api;
var lightState = hue.lightState;
module.exports = router;

//Get every light's state
 router.get('/', function(req,res){
 	api.lights()
 	.then(lights => res.send(lights))

 });

 //Change all the lights
 router.put('/', function(req,res){
 	var state= req.body;
	 api.setLightState(3, state);
	 api.setLightState(2,state)
	 api.setLightState(1,state)
	 res.sendStatus(201);

 });

//change all lights with different settings
router.put('/all', function(req, res){
	var lights= req.body;
	api.setLightState(1, {"on":true, xy: lights.light1,"effect": "none"});
	api.setLightState(2, {"on":true, xy: lights.light2,"effect": "none"});
	api.setLightState(3, {"on":true, xy: lights.light3,"effect": "none"});

});

router.put('/loop', function(req, res){
	for(var i=1; i<4; i++){
		api.setLightState(i,req.body);
	}
});

 //Change a specific light
 router.put('/:lightId', function(req,res){
 	var state = lightState.create().off();
 	     api.setLightState(1, state)
 	     .then(function(){
 	     	console.log("Light set successfully");
 	     });

 });


 //Start the colorLoop
