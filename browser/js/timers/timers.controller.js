'use strict'

app.controller('TimersController', function($scope){
	$scope.hours= 10;

	$scope.log= function(){
		console.log($scope.hours);
	}
})

