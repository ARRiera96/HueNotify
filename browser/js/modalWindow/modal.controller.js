app.controller('ModalInstanceCtrl', function ( $scope, $compile, $uibModalInstance, HueFactory) {

  $scope.colors= Object.keys(HueFactory.colors);

  $scope.ok = function () {
    $uibModalInstance.close($scope.result);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };



  $scope.setTimer= function(){
    console.log($scope.colors);
    console.log("COLOR", $scope.lightcolor)
    // $scope.$broadcast('timer-start');
    $scope.result.counter= ($scope.hours*60 + $scope.minutes)*60;
    $scope.$broadcast('timer-start');
    $scope.ok();

  }



});