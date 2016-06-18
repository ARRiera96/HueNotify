app.factory('HueFactory', function($http){
	return {
		colors: {"Aqua": [0.3088,0.3212],
                  "Coral": [0.5763,0.3486],
                  "Crimson": [0.6531,0.2834],
                  "Dark Magenta": [0.3787,0.1724]},

		changeColor: function(color){
			$http.put('http://192.168.1.131/api/oXIPp5-1E5qo2DTDf4y-DmaU6vXsZUNAWJuQTS7G/lights/3/state',{"on":true, xy:[this.colors[color][0], this.colors[color][1]], "alert": "lselect"})
			.then(function(){
				console.log("Color changed successfully");
			});
		},

		blueFlash: function(){
			$http.put('http://192.168.1.131/api/oXIPp5-1E5qo2DTDf4y-DmaU6vXsZUNAWJuQTS7G/lights/3/state', {"on": true, xy: [0.139,0.081]})
			.then(function(){
				console.log("blue flash came back");
			});
		}

	}


})