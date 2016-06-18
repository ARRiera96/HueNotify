app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: function($scope, HueFactory){
        	console.log("In link");
        	$scope.blueFlash= function(){
        		console.log("IN home link scope");
        		HueFactory.blueFlash();
        	}

        }
    });
});