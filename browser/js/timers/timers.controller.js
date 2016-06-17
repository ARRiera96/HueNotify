'use strict'

app.controller('TimersController', function($scope){
	$scope.hours= 10;

	  $scope.setTimer= function(){
	    $(element).countEverest({
	      //Set your target date here!
	      day: scope.numHours,
	      month: 6,
	      year: 2017,
	      leftHandZeros: false,
	      onChange: function() {
	          drawCircle($('#ce-hours').get(0), this.hours, 24);
	          drawCircle($('#ce-minutes').get(0), this.minutes, 60);
	          drawCircle($('#ce-seconds').get(0), this.seconds, 60);
	      }
	  })
	};

	  function deg(v) {
	      return (Math.PI/180) * v - (Math.PI/2);
	  }

	  function drawCircle(canvas, value, max) {
	      var primaryColor = '#117d8b',
	          secondaryColor = '#282828',
	          circle = canvas.getContext('2d');
	      circle.clearRect(0, 0, canvas.width, canvas.height);
	      circle.lineWidth = 4;

	      circle.beginPath();
	      circle.arc(
	          canvas.width / 2, 
	          canvas.height / 2, 
	          canvas.width / 2 - circle.lineWidth, 
	          deg(0), 
	          deg(360 / max * (max - value)), 
	          false);
	      circle.strokeStyle = secondaryColor;
	      circle.stroke();

	      circle.beginPath();
	      circle.arc(
	          canvas.width / 2, 
	          canvas.height / 2, 
	          canvas.width / 2 - circle.lineWidth, 
	          deg(0), 
	          deg(360 / max * (max - value)), 
	          true);
	      circle.strokeStyle = primaryColor;
	      circle.stroke();
	  }

})

