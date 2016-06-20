app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: function($scope,$http, HueFactory){
            $scope.colors= Object.keys(HueFactory.colors);
            $scope.activateLights= function(){
                console.log("I am here");
                var lights={
                    light1: $scope.light1.color,
                    light2: $scope.light2.color,
                    light3: $scope.light3.color
                }
                HueFactory.activateAllLights(lights);

            }

            $scope.loop= HueFactory.colorLoop;

        	$scope.globalFeels= function(){
        		$http.get('http://wefeel.csiro.au/api/emotions/primary/totals')
        		.then(function(totals){
        			var newTotals= totals.data;
        			var max=0;
        			var worldFeel='';
        			var color= "";
        			delete newTotals.other;
        			delete newTotals.joy;
        			delete newTotals['*'];
        			for(var prop in newTotals){
        				if(newTotals[prop] > max){
        					max= newTotals[prop];
        					worldFeel= prop;
        				}
        			}

        			switch(worldFeel){
        				case 'sadness':
	        				color='Midnight Blue'
	        				break;
        				case 'love':
	        				color='Salmon'
	        				break;
        				case 'anger':
	        				color='Firebrick'
	        				break;
        				case 'surprise':
	        				color='Yellow'
	        				break;
        				case 'fear':
	        				color='Dark Magenta'
	        				break;
        			}
                    HueFactory.changeState(color);

        		});
        	}

        }
    });
});