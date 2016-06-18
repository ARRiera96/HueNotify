app.factory('HueFactory', function($http){
	return {
		changeColor: function(){
			$http.put('http://192.168.1.131/api/oXIPp5-1E5qo2DTDf4y-DmaU6vXsZUNAWJuQTS7G/lights/3/state',{"on":true, "sat":254, "bri":254,"hue":10000})
			.then(function(){
				console.log("Color changed successfully");
			});
		}

	}


})