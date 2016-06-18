'use strict'

app.controller('TimersController', function($scope, $uibModal, $timeout, HueFactory){

	// $scope.counter=10;
	// 
	$scope.$on('timer-stopped', function(){
		console.log("The timer ended!!");
		HueFactory.changeColor();
	})

	$scope.timerStart= function(){
		$scope.$evalAsync();
		$timeout(function(){
			$scope.$broadcast('timer-start');
		}, 500)
	}





  $scope.open = function () {
  var modalInstance = $uibModal.open({
    animation: $scope.animationsEnabled,
    templateUrl: './js/modalWindow/modalTimer.html',
    scope: $scope,
    controller: 'ModalInstanceCtrl'
  });

  modalInstance.result.then(function (result) {
  	$scope.lightcolor = result.lightcolor;
    $scope.counter = result.counter;
    console.log("!!!!", $scope.lightcolor, $scope.counter);
    $scope.timerStart();
  });
};


})

