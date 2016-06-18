'use strict'

app.controller('TimersController', function($scope, $uibModal){

	$scope.counter=10;

	$scope.logIt= function(){
		$scope.$broadcast('timer-reset');
		$scope.counter= 1000;

		$scope.$broadcast('timer-start');
	}



  $scope.open = function () {
  var modalInstance = $uibModal.open({
    animation: $scope.animationsEnabled,
    templateUrl: './js/modalWindow/modalTimer.html',
    scope: $scope,
    controller: 'ModalInstanceCtrl'
  });

  modalInstance.result.then(function (counter) {
    $scope.counter = counter;
    // $scope.$broadcast('timer-reset');
    $scope.$broadcast('timer-start');
  });
};


})

