'use strict'

app.controller('TimersController', function($scope, $uibModal, $timeout){

	// $scope.counter=10;
	// 
	$scope.$on('timer-stopped', function(){
		console.log("The timer ended!!");
	})

	$scope.logIt= function(){
		console.log("IN log it");
		$scope.counter= 10;
		// $scope.$broadcast('timer-reset');
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

  modalInstance.result.then(function (counter) {
    $scope.counter = counter;
    // $scope.$broadcast('timer-reset');
    $scope.$broadcast('timer-start');
  });
};


})

