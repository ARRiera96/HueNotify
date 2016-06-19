app.factory('HueFactory', function($http){
	return {
		colors: {"Aqua": [0.3088,0.3212],
                  "Coral": [0.5763,0.3486],
                  "Crimson": [0.6531,0.2834],
                  "Dark Magenta": [0.3787,0.1724]},

		changeColor: function(color){
			$http.put('/api/hue',{"on":true, xy:[this.colors[color][0], this.colors[color][1]], "alert": "lselect", "effect": "none"})
			.then(function(){
				console.log("Color changed successfully");
			});
		},

		blueFlash: function(){
			$http.put('/api/hue', {"on": true, xy: [0.139,0.081], "alarm": "select"})
			.then(function(){
				console.log("blue flash came back");
			});
		}

	}


})