app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: function($scope, HueFactory){
        	$scope.blueFlash= function(){
        		HueFactory.blueFlash();
        	}

        }
    });
});