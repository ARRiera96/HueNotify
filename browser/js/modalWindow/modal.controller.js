app.controller('ModalInstanceCtrl', function ( $scope, $compile, $uibModalInstance, HueFactory) {

  $scope.colors= Object.keys(HueFactory.colors);
  $scope.hours=0;
  $scope.minutes=0;
  $scope.seconds=0;

  $scope.ok = function () {
    $uibModalInstance.close($scope.result);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };



  $scope.setTimer= function(){
    $scope.result.counter= ($scope.hours*60 + $scope.minutes)*60+$scope.seconds;
    $scope.$broadcast('timer-start');
    $scope.ok();

  }



});