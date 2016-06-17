'use strict'

app.config(($stateProvider) => {

  $stateProvider.state('timers', {
    url: '/timers',
    templateUrl: 'js/timers/templates/timers.html',
    controller: 'TimersController',
    // resolve: {
    //   // allOrders: (OrdersFactory) => {
    //   //   return OrdersFactory.getAll()
    //   // },
    // }
  })

  $stateProvider.state('timer', {
    url: '/timers',
    templateUrl: 'js/timers/templates/timer.html',
    controller: 'TimerController',
    resolve: {
      // allOrders: (OrdersFactory) => {
      //   return OrdersFactory.getAll()
      // },
    }
  })

});