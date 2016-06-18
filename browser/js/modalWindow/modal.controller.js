app.controller('ModalInstanceCtrl', function ( $scope, $compile, $uibModalInstance) {

  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };


  $scope.setTimer= function(){
    $scope.$broadcast('timer-start');
    // if(!$scope.minutes) $scope.minutes=0;
    // var date = new Date();
    // var hour= date.getHours();
    // var mins= date.getMinutes();
    // var time= {};

    // console.log(hour, mins);

    // function checkTime(hr, min){
    //   var hrToMin= hr/60;
    //   if(mins+min>59){
    //     time.min= mins+min - 60;
    //     hour++;
    //     time.hour++;
    //   }
    //   else time.min= mins+min;
    //   if(hour+hr>23) time.hour= hour+hr -24;
    //   else time.hour= hour+hr
    // }

    // checkTime($scope.hours, $scope.minutes);
    // console.log(time);

    // $('.countdown').countEverest({
    //   day: 17,
    //   month: 6,
    //   year: 2016,
    //   hour: time.hour,
    //   minute: time.min,
    //   second: 0,
    //   millisecond: 0,
    //   onComplete: function(){
    //     console.log("TIMER IS UP!");
    //   }
    // });


    $scope.ok();

  }



});