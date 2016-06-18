'use strict'

app.controller('TimersController', function($scope, $uibModal, $timeout, HueFactory){

	// $scope.counter=10;
	//
	$scope.timers= [];

	// $scope.$on('timer-stopped', function(){
	// 	console.log("The timer ended!!");
	// 	console.log(this);
	// 	HueFactory.changeColor(this.lightcolor);
	// })


	$scope.timerStart= function(){
		var currentTimer = this;
		$scope.$evalAsync();
		this.$broadcast('timer-start');
		this.$on('timer-stopped', function(){
			console.log(currentTimer.timer.lightcolor);
			HueFactory.changeColor(currentTimer.timer.lightcolor);
		})
	}





  $scope.open = function () {
  var modalInstance = $uibModal.open({
    animation: $scope.animationsEnabled,
    templateUrl: './js/modalWindow/modalTimer.html',
    scope: $scope,
    controller: 'ModalInstanceCtrl'
  });

  modalInstance.result.then(function (result) {
  	$scope.timers.push(result);
  });
};


})

