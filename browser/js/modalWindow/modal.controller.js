app.controller('ModalInstanceCtrl', function ( $scope, $compile, $uibModalInstance) {

  $scope.ok = function () {
    $uibModalInstance.close($scope.counter);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };


  $scope.setTimer= function(){
    // $scope.$broadcast('timer-start');
    $scope.counter= ($scope.hours*60 + $scope.minutes)*60;
    console.log($scope.buddy+' '+$scope.counter);
    $scope.$broadcast('timer-start');
    $scope.ok();

  }



});