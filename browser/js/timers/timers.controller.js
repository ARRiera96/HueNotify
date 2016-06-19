'use strict'

app.controller('TimersController', function($scope, $rootScope, $uibModal, $timeout, HueFactory, localStorageService){

	var timers = localStorageService.get('timers');

	$scope.timers = timers || [];

	$scope.$watch('timers', function () {
	  localStorageService.set('timers', $scope.timers);
	}, true);


	$scope.start= function(){
		var currentTimer = this;
		$scope.$evalAsync();
		this.$broadcast('timer-start');
		this.$on('timer-stopped', function(){
			console.log(currentTimer.timer.lightcolor);
			HueFactory.changeColor(currentTimer.timer.lightcolor);
		})
	}

	$scope.pause= function(){
		this.$broadcast('timer-stop');
	}

	$scope.resume= function(){
		this.$broadcast('timer-resume');
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

