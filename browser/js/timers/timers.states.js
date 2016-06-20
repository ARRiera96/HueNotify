'use strict'

app.config(function($stateProvider){
  $stateProvider.state('timers', {
    url: '/timers',
    templateUrl: 'js/timers/templates/timers.html',
    controller: 'TimersController'
  })

});