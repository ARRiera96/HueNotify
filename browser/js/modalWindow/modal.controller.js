app.controller('ModalInstanceCtrl', function ( $scope, $compile, $uibModalInstance) {

  $scope.ok = function () {
    $uibModalInstance.close($scope.result);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };



  $scope.setTimer= function(){
    console.log("COLOR", $scope.lightcolor)
    // $scope.$broadcast('timer-start');
    $scope.result.counter= ($scope.hours*60 + $scope.minutes)*60;
    $scope.$broadcast('timer-start');
    $scope.ok();

  }



});