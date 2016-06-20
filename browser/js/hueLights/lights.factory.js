app.factory('HueFactory', function($http){
	return {
		colors: {"Aqua": [0.3088,0.3212],
                  "Coral": [0.5763,0.3486],
                  "Crimson": [0.6531,0.2834],
                  "Dark Magenta": [0.3787,0.1724],
                  "Maroon": [0.5383,0.2566],
                  "Midnight Blue": [0.1585,0.0884],
                  "Orange Red": [0.6726,0.3217],
                  "Olive": [0.4432,0.5154],
                  "Salmon": [0.5346,0.3247],
                  "Yellow": [0.3517,0.5618],
                  "Medium Spring Green": [0.1919,0.524],
                  "Firebrick": [0.6621,0.3023],
                  "Dark Red": [0.7,0.2986],
                  "Blue": [0.139,0.081]
              },

		changeColor: function(color){
			$http.put('/api/hue',{"on":true, xy:[this.colors[color][0], this.colors[color][1]], "alert": "lselect", "effect": "none"})
			.then(function(){
				console.log("Color changed successfully");
			});
		},

		changeState: function(color){
			console.log(color);
			$http.put('/api/hue', {"on":true, xy:[this.colors[color][0], this.colors[color][1]],"effect": "none"})
			.then(function(){
				console.log("blue flash came back");
			});
		},
		turnLightsOff: function(){
			$http.put('/api/hue', {"on": false})
			.then(function(){
				console.log("Lights turned off");
			});
		},
		activateAllLights: function(lights){
			lights.light1= this.colors[lights.light1];
			lights.light2= this.colors[lights.light2];
			lights.light3= this.colors[lights.light3];
			console.log(lights);
			$http.put('/api/hue/all',lights)
			.then(function(){
				console.log("Noches de fantasia");
			})
		},
		colorLoop: function(){
			$http.put('/api/hue/loop', {"on":true, xy:[0.6621,0.3023],"effect": "colorloop"})
			.then(function(){
				console.log("blue flash came back");
			});
		}

	}


})