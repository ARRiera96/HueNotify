'use strict'

app.config(($stateProvider) => {

  $stateProvider.state('notifications', {
    url: '/timers',
    templateUrl: 'js/notifications/templates/notifications.html',
    controller: 'NotificationsController',
    resolve: {
      // allOrders: (OrdersFactory) => {
      //   return OrdersFactory.getAll()
      // },
    }
  })

});