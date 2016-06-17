'use strict'

app.controller('TimersController', function($scope, $uibModal){
	$scope.hours= 0;


  $scope.open = function () {
  var modalInstance = $uibModal.open({
    animation: $scope.animationsEnabled,
    templateUrl: './js/modalWindow/modalTimer.html',
    controller: 'ModalInstanceCtrl'
  });
};


})

