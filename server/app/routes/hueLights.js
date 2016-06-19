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
 	// var state = lightState.create().brightness(100).rgb(10, 7, 12).on().colorLoop();
 	console.log("Im in here hello");
 	var state= req.body;
 	console.log(state);
	 api.setLightState(3, state);
	 api.setLightState(2,state)
	 api.setLightState(1,state)
	 res.sendStatus(201);

 });

 //Change a specific light
 router.put('/:lightId', function(req,res){
 	console.log("In here");
 	var state = lightState.create().off();
 	     api.setLightState(1, state)
 	     .then(function(){
 	     	console.log("Light set successfully");
 	     });

 });


 //Start the colorLoop
