app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: function($scope,$http, HueFactory){
        	$scope.globalFeels= function(){
        		$http.get('http://wefeel.csiro.au/api/emotions/primary/totals')
        		.then(function(totals){
        			console.log(totals.data);
        		});




        		HueFactory.blueFlash();
        	}

        }
    });
});