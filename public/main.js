'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

window.app = angular.module('FullstackGeneratedApp', ['fsaPreBuilt', 'ui.router', 'ui.bootstrap', 'ngAnimate', 'timer', 'LocalStorageModule']);

app.config(function ($urlRouterProvider, $locationProvider, localStorageServiceProvider, $httpProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    $locationProvider.html5Mode(true);
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');
    // Trigger page refresh when accessing an OAuth route
    $urlRouterProvider.when('/auth/:provider', function () {
        window.location.reload();
    });

    localStorageServiceProvider.setPrefix('ls');

    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
});

// This app.run is for controlling access to specific states.
app.run(function ($rootScope, AuthService, $state) {

    // The given state requires an authenticated user.
    var destinationStateRequiresAuth = function destinationStateRequiresAuth(state) {
        return state.data && state.data.authenticate;
    };

    // $stateChangeStart is an event fired
    // whenever the process of changing a state begins.
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

        if (!destinationStateRequiresAuth(toState)) {
            // The destination state does not require authentication
            // Short circuit with return.
            return;
        }

        if (AuthService.isAuthenticated()) {
            // The user is authenticated.
            // Short circuit with return.
            return;
        }

        // Cancel navigating to new state.
        event.preventDefault();

        AuthService.getLoggedInUser().then(function (user) {
            // If a user is retrieved, then renavigate to the destination
            // (the second time, AuthService.isAuthenticated() will work)
            // otherwise, if no user is logged in, go to "login" state.
            if (user) {
                $state.go(toState.name, toParams);
            } else {
                $state.go('login');
            }
        });
    });
});

app.config(function ($stateProvider) {

    // Register our *about* state.
    $stateProvider.state('about', {
        url: '/about',
        controller: 'AboutController',
        templateUrl: 'js/about/about.html'
    });
});

app.controller('AboutController', function ($scope, FullstackPics) {

    // Images of beautiful Fullstack people.
    $scope.images = _.shuffle(FullstackPics);
});
app.config(function ($stateProvider) {
    $stateProvider.state('docs', {
        url: '/docs',
        templateUrl: 'js/docs/docs.html'
    });
});

(function () {

    'use strict';

    // Hope you didn't forget Angular! Duh-doy.

    if (!window.angular) throw new Error('I can\'t find Angular!');

    var app = angular.module('fsaPreBuilt', []);

    app.factory('Socket', function () {
        if (!window.io) throw new Error('socket.io not found!');
        return window.io(window.location.origin);
    });

    // AUTH_EVENTS is used throughout our app to
    // broadcast and listen from and to the $rootScope
    // for important events about authentication flow.
    app.constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    });

    app.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
        var statusDict = {
            401: AUTH_EVENTS.notAuthenticated,
            403: AUTH_EVENTS.notAuthorized,
            419: AUTH_EVENTS.sessionTimeout,
            440: AUTH_EVENTS.sessionTimeout
        };
        return {
            responseError: function responseError(response) {
                $rootScope.$broadcast(statusDict[response.status], response);
                return $q.reject(response);
            }
        };
    });

    app.config(function ($httpProvider) {
        $httpProvider.interceptors.push(['$injector', function ($injector) {
            return $injector.get('AuthInterceptor');
        }]);
    });

    app.service('AuthService', function ($http, Session, $rootScope, AUTH_EVENTS, $q) {

        function onSuccessfulLogin(response) {
            var data = response.data;
            Session.create(data.id, data.user);
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            return data.user;
        }

        // Uses the session factory to see if an
        // authenticated user is currently registered.
        this.isAuthenticated = function () {
            return !!Session.user;
        };

        this.getLoggedInUser = function (fromServer) {

            // If an authenticated session exists, we
            // return the user attached to that session
            // with a promise. This ensures that we can
            // always interface with this method asynchronously.

            // Optionally, if true is given as the fromServer parameter,
            // then this cached value will not be used.

            if (this.isAuthenticated() && fromServer !== true) {
                return $q.when(Session.user);
            }

            // Make request GET /session.
            // If it returns a user, call onSuccessfulLogin with the response.
            // If it returns a 401 response, we catch it and instead resolve to null.
            return $http.get('/session').then(onSuccessfulLogin).catch(function () {
                return null;
            });
        };

        this.login = function (credentials) {
            return $http.post('/login', credentials).then(onSuccessfulLogin).catch(function () {
                return $q.reject({ message: 'Invalid login credentials.' });
            });
        };

        this.logout = function () {
            return $http.get('/logout').then(function () {
                Session.destroy();
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
            });
        };
    });

    app.service('Session', function ($rootScope, AUTH_EVENTS) {

        var self = this;

        $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
            self.destroy();
        });

        $rootScope.$on(AUTH_EVENTS.sessionTimeout, function () {
            self.destroy();
        });

        this.id = null;
        this.user = null;

        this.create = function (sessionId, user) {
            this.id = sessionId;
            this.user = user;
        };

        this.destroy = function () {
            this.id = null;
            this.user = null;
        };
    });
})();

app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: function controller($scope, $http, HueFactory) {

            $scope.colors = Object.keys(HueFactory.colors);

            $scope.activateLights = function () {
                var lights = {
                    light1: $scope.light1.color,
                    light2: $scope.light2.color,
                    light3: $scope.light3.color
                };
                HueFactory.activateAllLights(lights);
            };

            $scope.loop = HueFactory.colorLoop;

            $scope.globalFeels = function () {
                $http.get('http://wefeel.csiro.au/api/emotions/primary/totals').then(function (totals) {
                    var newTotals = totals.data;
                    console.log(newTotals);
                    var max = 0;
                    var worldFeel = '';
                    var color = "";
                    delete newTotals.other;
                    delete newTotals.surprise;
                    delete newTotals['*'];
                    for (var prop in newTotals) {
                        if (newTotals[prop] > max) {
                            max = newTotals[prop];
                            worldFeel = prop;
                        }
                    }

                    switch (worldFeel) {
                        case 'sadness':
                            color = 'Midnight Blue';
                            break;
                        case 'love':
                            color = 'Salmon';
                            break;
                        case 'anger':
                            color = 'Firebrick';
                            break;
                        case 'joy':
                            color = 'Yellow';
                            break;
                        case 'surprise':
                            color = 'Medium Spring Green';
                            break;
                        case 'fear':
                            color = 'Dark Magenta';
                            break;
                    }
                    HueFactory.changeState(color);
                });
            };

            $scope.lightOff = HueFactory.turnLightsOff;
        }
    });
});
app.factory('HueFactory', function ($http) {
    return {
        colors: _defineProperty({ "Aqua": [0.3088, 0.3212],
            "Coral": [0.5763, 0.3486],
            "Crimson": [0.6531, 0.2834],
            "Dark Magenta": [0.3787, 0.1724],
            "Maroon": [0.5383, 0.2566],
            "Midnight Blue": [0.1585, 0.0884],
            "Orange Red": [0.6726, 0.3217],
            "Olive": [0.4432, 0.5154],
            "Salmon": [0.5346, 0.3247],
            "Yellow": [0.3517, 0.5618],
            "Medium Spring Green": [0.1919, 0.524],
            "Firebrick": [0.6621, 0.3023],
            "Dark Red": [0.7, 0.2986],
            "Blue": [0.139, 0.081]
        }, 'Medium Spring Green', [0.1919, 0.524]),

        changeColor: function changeColor(color) {
            $http.put('/api/hue', { "on": true, xy: [this.colors[color][0], this.colors[color][1]], "alert": "lselect", "effect": "none" });
        },

        changeState: function changeState(color) {
            $http.put('/api/hue', { "on": true, xy: [this.colors[color][0], this.colors[color][1]], "effect": "none" });
        },
        turnLightsOff: function turnLightsOff() {
            $http.put('/api/hue', { "on": false });
        },
        activateAllLights: function activateAllLights(lights) {
            lights.light1 = this.colors[lights.light1];
            lights.light2 = this.colors[lights.light2];
            lights.light3 = this.colors[lights.light3];
            $http.put('/api/hue/all', lights);
        },
        colorLoop: function colorLoop() {
            $http.put('/api/hue/loop', { "on": true, xy: [0.6621, 0.3023], "effect": "colorloop" }).then(function () {
                console.log("blue flash came back");
            });
        }

    };
});
app.config(function ($stateProvider) {

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'js/login/login.html',
        controller: 'LoginCtrl'
    });
});

app.controller('LoginCtrl', function ($scope, AuthService, $state) {

    $scope.login = {};
    $scope.error = null;

    $scope.sendLogin = function (loginInfo) {

        $scope.error = null;

        AuthService.login(loginInfo).then(function () {
            $state.go('home');
        }).catch(function () {
            $scope.error = 'Invalid login credentials.';
        });
    };
});
app.config(function ($stateProvider) {

    $stateProvider.state('membersOnly', {
        url: '/members-area',
        template: '<img ng-repeat="item in stash" width="300" ng-src="{{ item }}" />',
        controller: function controller($scope, SecretStash) {
            SecretStash.getStash().then(function (stash) {
                $scope.stash = stash;
            });
        },
        // The following data.authenticate is read by an event listener
        // that controls access to this state. Refer to app.js.
        data: {
            authenticate: true
        }
    });
});

app.factory('SecretStash', function ($http) {

    var getStash = function getStash() {
        return $http.get('/api/members/secret-stash').then(function (response) {
            return response.data;
        });
    };

    return {
        getStash: getStash
    };
});
app.controller('ModalInstanceCtrl', function ($scope, $compile, $uibModalInstance, HueFactory) {

    $scope.colors = Object.keys(HueFactory.colors);
    $scope.hours = 0;
    $scope.minutes = 0;
    $scope.seconds = 0;

    $scope.ok = function () {
        $uibModalInstance.close($scope.result);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.setTimer = function () {
        $scope.result.counter = ($scope.hours * 60 + $scope.minutes) * 60 + $scope.seconds;
        $scope.$broadcast('timer-start');
        $scope.ok();
    };
});
'use strict';

app.controller('NotificationsController', function ($scope) {});
'use strict';

app.config(function ($stateProvider) {

    $stateProvider.state('notifications', {
        url: '/timers',
        templateUrl: 'js/notifications/templates/notifications.html',
        controller: 'NotificationsController',
        resolve: {
            // allOrders: (OrdersFactory) => {
            //   return OrdersFactory.getAll()
            // },
        }
    });
});
'use strict';

app.controller('TimersController', function ($scope, $rootScope, $uibModal, $timeout, HueFactory, localStorageService) {
    var timers = localStorageService.get('timers');

    $scope.timers = timers || [];

    $scope.$watch('timers', function () {
        localStorageService.set('timers', $scope.timers);
    }, true);

    $scope.start = function () {
        var currentTimer = this;
        $scope.$evalAsync();
        this.$broadcast('timer-start');
        this.$on('timer-stopped', function () {
            HueFactory.changeColor(currentTimer.timer.lightcolor);
        });
    };

    $scope.pause = function () {
        this.$broadcast('timer-stop');
        HueFactory.turnLightsOff();
    };

    $scope.resume = function () {
        this.$broadcast('timer-resume');
    };

    $scope.delete = function () {
        var label = this.timer.label;
        var index;
        $scope.timers.forEach(function (timer, i) {
            if (timer.label === label) {
                index = i;
            }
        });
        $scope.timers.splice(index, 1);
    };

    $scope.lightOff = function () {
        HueFactory.turnLightsOff();
    };

    $scope.open = function () {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: './js/modalWindow/modalTimer.html',
            scope: $scope,
            controller: 'ModalInstanceCtrl'
        });

        modalInstance.result.then(function (result) {
            $scope.timers.push(result);
        });
    };
});

'use strict';

app.config(function ($stateProvider) {
    $stateProvider.state('timers', {
        url: '/timers',
        templateUrl: 'js/timers/templates/timers.html',
        controller: 'TimersController'
    });
});
app.factory('FullstackPics', function () {
    return ['https://pbs.twimg.com/media/B7gBXulCAAAXQcE.jpg:large', 'https://fbcdn-sphotos-c-a.akamaihd.net/hphotos-ak-xap1/t31.0-8/10862451_10205622990359241_8027168843312841137_o.jpg', 'https://pbs.twimg.com/media/B-LKUshIgAEy9SK.jpg', 'https://pbs.twimg.com/media/B79-X7oCMAAkw7y.jpg', 'https://pbs.twimg.com/media/B-Uj9COIIAIFAh0.jpg:large', 'https://pbs.twimg.com/media/B6yIyFiCEAAql12.jpg:large', 'https://pbs.twimg.com/media/CE-T75lWAAAmqqJ.jpg:large', 'https://pbs.twimg.com/media/CEvZAg-VAAAk932.jpg:large', 'https://pbs.twimg.com/media/CEgNMeOXIAIfDhK.jpg:large', 'https://pbs.twimg.com/media/CEQyIDNWgAAu60B.jpg:large', 'https://pbs.twimg.com/media/CCF3T5QW8AE2lGJ.jpg:large', 'https://pbs.twimg.com/media/CAeVw5SWoAAALsj.jpg:large', 'https://pbs.twimg.com/media/CAaJIP7UkAAlIGs.jpg:large', 'https://pbs.twimg.com/media/CAQOw9lWEAAY9Fl.jpg:large', 'https://pbs.twimg.com/media/B-OQbVrCMAANwIM.jpg:large', 'https://pbs.twimg.com/media/B9b_erwCYAAwRcJ.png:large', 'https://pbs.twimg.com/media/B5PTdvnCcAEAl4x.jpg:large', 'https://pbs.twimg.com/media/B4qwC0iCYAAlPGh.jpg:large', 'https://pbs.twimg.com/media/B2b33vRIUAA9o1D.jpg:large', 'https://pbs.twimg.com/media/BwpIwr1IUAAvO2_.jpg:large', 'https://pbs.twimg.com/media/BsSseANCYAEOhLw.jpg:large', 'https://pbs.twimg.com/media/CJ4vLfuUwAAda4L.jpg:large', 'https://pbs.twimg.com/media/CI7wzjEVEAAOPpS.jpg:large', 'https://pbs.twimg.com/media/CIdHvT2UsAAnnHV.jpg:large', 'https://pbs.twimg.com/media/CGCiP_YWYAAo75V.jpg:large', 'https://pbs.twimg.com/media/CIS4JPIWIAI37qu.jpg:large'];
});

app.factory('RandomGreetings', function () {

    var getRandomFromArray = function getRandomFromArray(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    };

    var greetings = ['Hello, world!', 'At long last, I live!', 'Hello, simple human.', 'What a beautiful day!', 'I\'m like any other project, except that I am yours. :)', 'This empty string is for Lindsay Levine.', 'こんにちは、ユーザー様。', 'Welcome. To. WEBSITE.', ':D', 'Yes, I think we\'ve met before.', 'Gimme 3 mins... I just grabbed this really dope frittata', 'If Cooper could offer only one piece of advice, it would be to nevSQUIRREL!'];

    return {
        greetings: greetings,
        getRandomGreeting: function getRandomGreeting() {
            return getRandomFromArray(greetings);
        }
    };
});

app.directive('fullstackLogo', function () {
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/fullstack-logo/fullstack-logo.html'
    };
});
app.directive('navbar', function ($rootScope, AuthService, AUTH_EVENTS, $state) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/common/directives/navbar/navbar.html',
        link: function link(scope) {

            scope.items = [{ label: 'Lights', state: 'home' }, { label: 'Timers', state: 'timers' }, { label: 'Notifications', state: 'notifications' }];

            scope.user = null;

            scope.isLoggedIn = function () {
                return AuthService.isAuthenticated();
            };

            scope.logout = function () {
                AuthService.logout().then(function () {
                    $state.go('home');
                });
            };

            var setUser = function setUser() {
                AuthService.getLoggedInUser().then(function (user) {
                    scope.user = user;
                });
            };

            var removeUser = function removeUser() {
                scope.user = null;
            };

            setUser();

            $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);
        }

    };
});

app.directive('randoGreeting', function (RandomGreetings) {

    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/rando-greeting/rando-greeting.html',
        link: function link(scope) {
            scope.greeting = RandomGreetings.getRandomGreeting();
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiZG9jcy9kb2NzLmpzIiwiZnNhL2ZzYS1wcmUtYnVpbHQuanMiLCJob21lL2hvbWUuanMiLCJodWVMaWdodHMvbGlnaHRzLmZhY3RvcnkuanMiLCJsb2dpbi9sb2dpbi5qcyIsIm1lbWJlcnMtb25seS9tZW1iZXJzLW9ubHkuanMiLCJtb2RhbFdpbmRvdy9tb2RhbC5jb250cm9sbGVyLmpzIiwibm90aWZpY2F0aW9ucy9ub3RpZmljYXRpb25zLmNvbnRyb2xsZXIuanMiLCJub3RpZmljYXRpb25zL25vdGlmaWNhdGlvbnMuc3RhdGUuanMiLCJ0aW1lcnMvdGltZXJzLmNvbnRyb2xsZXIuanMiLCJ0aW1lcnMvdGltZXJzLnN0YXRlcy5qcyIsImNvbW1vbi9mYWN0b3JpZXMvRnVsbHN0YWNrUGljcy5qcyIsImNvbW1vbi9mYWN0b3JpZXMvUmFuZG9tR3JlZXRpbmdzLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvZnVsbHN0YWNrLWxvZ28vZnVsbHN0YWNrLWxvZ28uanMiLCJjb21tb24vZGlyZWN0aXZlcy9uYXZiYXIvbmF2YmFyLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvcmFuZG8tZ3JlZXRpbmcvcmFuZG8tZ3JlZXRpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUFDQSxPQUFBLEdBQUEsR0FBQSxRQUFBLE1BQUEsQ0FBQSx1QkFBQSxFQUFBLENBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxFQUFBLE9BQUEsRUFBQSxvQkFBQSxDQUFBLENBQUE7O0FBRUEsSUFBQSxNQUFBLENBQUEsVUFBQSxrQkFBQSxFQUFBLGlCQUFBLEVBQUEsMkJBQUEsRUFBQSxhQUFBLEVBQUE7O0FBRUEsc0JBQUEsU0FBQSxDQUFBLElBQUE7O0FBRUEsdUJBQUEsU0FBQSxDQUFBLEdBQUE7O0FBRUEsdUJBQUEsSUFBQSxDQUFBLGlCQUFBLEVBQUEsWUFBQTtBQUNBLGVBQUEsUUFBQSxDQUFB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QSxFQUFBLElBQUEsQ0FBQSxLQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxTQXhCQTtBQXlCQSx1QkFBQSx5QkFBQTtBQUNBLGtCQUFBLEdBQUEsQ0FBQSxVQUFBLEVBQUEsRUFBQSxNQUFBLEtBQUEsRUFBQTtBQUNBLFNBM0JBO0FBNEJBLDJCQUFBLDJCQUFBLE1BQUEsRUFBQTtBQUNBLG1CQUFBLE1BQUEsR0FBQSxLQUFBLE1BQUEsQ0FBQSxPQUFBLE1BQUEsQ0FBQTtBQUNBLG1CQUFBLE1BQUEsR0FBQSxLQUFBLE1BQUEsQ0FBQSxPQUFBLE1BQUEsQ0FBQTtBQUNBLG1CQUFBLE1BQUEsR0FBQSxLQUFBLE1BQUEsQ0FBQSxPQUFBLE1BQUEsQ0FBQTtBQUNBLGtCQUFBLEdBQUEsQ0FBQSxjQUFBLEVBQUEsTUFBQTtBQUNBLFNBakNBO0FBa0NBLG1CQUFBLHFCQUFBO0FBQ0Esa0JBQUEsR0FBQSxDQUFBLGVBQUEsRUFBQSxFQUFBLE1BQUEsSUFBQSxFQUFBLElBQUEsQ0FBQSxNQUFBLEVBQUEsTUFBQSxDQUFBLEVBQUEsVUFBQSxXQUFBLEVBQUEsRUFDQSxJQURBLENBQ0EsWUFBQTtBQUNBLHdCQUFBLEdBQUEsQ0FBQSxzQkFBQTtBQUNBLGFBSEE7QUFJQTs7QUF2Q0EsS0FBQTtBQTRDQSxDQTdDQTtBQ0FBLElBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLG1CQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxhQUFBLFFBREE7QUFFQSxxQkFBQSxxQkFGQTtBQUdBLG9CQUFBO0FBSEEsS0FBQTtBQU1BLENBUkE7O0FBVUEsSUFBQSxVQUFBLENBQUEsV0FBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7O0FBRUEsV0FBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxHQUFBLElBQUE7O0FBRUEsV0FBQSxTQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUE7O0FBRUEsZUFBQSxLQUFBLEdBQUEsSUFBQTs7QUFFQSxvQkFBQSxLQUFBLENBQUEsU0FBQSxFQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsbUJBQUEsRUFBQSxDQUFBLE1BQUE7QUFDQSxTQUZBLEVBRUEsS0FGQSxDQUVBLFlBQUE7QUFDQSxtQkFBQSxLQUFBLEdBQUEsNEJBQUE7QUFDQSxTQUpBO0FBTUEsS0FWQTtBQVlBLENBakJBO0FDVkEsSUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsbUJBQUEsS0FBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLGFBQUEsZUFEQTtBQUVBLGtCQUFBLG1FQUZBO0FBR0Esb0JBQUEsb0JBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLHdCQUFBLFFBQUEsR0FBQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSx1QkFBQSxLQUFBLEdBQUEsS0FBQTtBQUNBLGFBRkE7QUFHQSxTQVBBOzs7QUFVQSxjQUFBO0FBQ0EsMEJBQUE7QUFEQTtBQVZBLEtBQUE7QUFlQSxDQWpCQTs7QUFtQkEsSUFBQSxPQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFFBQUEsV0FBQSxTQUFBLFFBQUEsR0FBQTtBQUNBLGVBQUEsTUFBQSxHQUFBLENBQUEsMkJBQUEsRUFBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxtQkFBQSxTQUFBLElBQUE7QUFDQSxTQUZBLENBQUE7QUFHQSxLQUpBOztBQU1BLFdBQUE7QUFDQSxrQkFBQTtBQURBLEtBQUE7QUFJQSxDQVpBO0FDbkJBLElBQUEsVUFBQSxDQUFBLG1CQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsUUFBQSxFQUFBLGlCQUFBLEVBQUEsVUFBQSxFQUFBOztBQUVBLFdBQUEsTUFBQSxHQUFBLE9BQUEsSUFBQSxDQUFBLFdBQUEsTUFBQSxDQUFBO0FBQ0EsV0FBQSxLQUFBLEdBQUEsQ0FBQTtBQUNBLFdBQUEsT0FBQSxHQUFBLENBQUE7QUFDQSxXQUFBLE9BQUEsR0FBQSxDQUFBOztBQUVBLFdBQUEsRUFBQSxHQUFBLFlBQUE7QUFDQSwwQkFBQSxLQUFBLENBQUEsT0FBQSxNQUFBO0FBQ0EsS0FGQTs7QUFJQSxXQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsMEJBQUEsT0FBQSxDQUFBLFFBQUE7QUFDQSxLQUZBOztBQU1BLFdBQUEsUUFBQSxHQUFBLFlBQUE7QUFDQSxlQUFBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsQ0FBQSxPQUFBLEtBQUEsR0FBQSxFQUFBLEdBQUEsT0FBQSxPQUFBLElBQUEsRUFBQSxHQUFBLE9BQUEsT0FBQTtBQUNBLGVBQUEsVUFBQSxDQUFBLGFBQUE7QUFDQSxlQUFBLEVBQUE7QUFFQSxLQUxBO0FBU0EsQ0ExQkE7QUNBQTs7QUFFQSxJQUFBLFVBQUEsQ0FBQSx5QkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLENBR0EsQ0FIQTtBQ0ZBOztBQUVBLElBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLG1CQUFBLEtBQUEsQ0FBQSxlQUFBLEVBQUE7QUFDQSxhQUFBLFNBREE7QUFFQSxxQkFBQSwrQ0FGQTtBQUdBLG9CQUFBLHlCQUhBO0FBSUEsaUJBQUE7Ozs7QUFBQTtBQUpBLEtBQUE7QUFXQSxDQWJBO0FDRkE7O0FBRUEsSUFBQSxVQUFBLENBQUEsa0JBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxVQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxVQUFBLEVBQUEsbUJBQUEsRUFBQTtBQUNBLFFBQUEsU0FBQSxvQkFBQSxHQUFBLENBQUEsUUFBQSxDQUFBOztBQUVBLFdBQUEsTUFBQSxHQUFBLFVBQUEsRUFBQTs7QUFFQSxXQUFBLE1BQUEsQ0FBQSxRQUFBLEVBQUEsWUFBQTtBQUNBLDRCQUFBLEdBQUEsQ0FBQSxRQUFBLEVBQUEsT0FBQSxNQUFBO0FBQ0EsS0FGQSxFQUVBLElBRkE7O0FBS0EsV0FBQSxLQUFBLEdBQUEsWUFBQTtBQUNBLFlBQUEsZUFBQSxJQUFBO0FBQ0EsZUFBQSxVQUFBO0FBQ0EsYUFBQSxVQUFBLENBQUEsYUFBQTtBQUNBLGFBQUEsR0FBQSxDQUFBLGVBQUEsRUFBQSxZQUFBO0FBQ0EsdUJBQUEsV0FBQSxDQUFBLGFBQUEsS0FBQSxDQUFBLFVBQUE7QUFDQSxTQUZBO0FBR0EsS0FQQTs7QUFTQSxXQUFBLEtBQUEsR0FBQSxZQUFBO0FBQ0EsYUFBQSxVQUFBLENBQUEsWUFBQTtBQUNBLG1CQUFBLGFBQUE7QUFDQSxLQUhBOztBQUtBLFdBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxhQUFBLFVBQUEsQ0FBQSxjQUFBO0FBQ0EsS0FGQTs7QUFJQSxXQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsWUFBQSxRQUFBLEtBQUEsS0FBQSxDQUFBLEtBQUE7QUFDQSxZQUFBLEtBQUE7QUFDQSxlQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxLQUFBLEVBQUEsQ0FBQSxFQUFBO0FBQ0EsZ0JBQUEsTUFBQSxLQUFBLEtBQUEsS0FBQSxFQUFBO0FBQ0Esd0JBQUEsQ0FBQTtBQUNBO0FBQ0EsU0FKQTtBQUtBLGVBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtBQUVBLEtBVkE7O0FBWUEsV0FBQSxRQUFBLEdBQUEsWUFBQTtBQUNBLG1CQUFBLGFBQUE7QUFDQSxLQUZBOztBQU1BLFdBQUEsSUFBQSxHQUFBLFlBQUE7QUFDQSxZQUFBLGdCQUFBLFVBQUEsSUFBQSxDQUFBO0FBQ0EsdUJBQUEsT0FBQSxpQkFEQTtBQUVBLHlCQUFBLGtDQUZBO0FBR0EsbUJBQUEsTUFIQTtBQUlBLHdCQUFBO0FBSkEsU0FBQSxDQUFBOztBQU9BLHNCQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxtQkFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLE1BQUE7QUFDQSxTQUZBO0FBR0EsS0FYQTtBQWNBLENBNURBOztBQ0ZBOztBQUVBLElBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLGFBQUEsU0FEQTtBQUVBLHFCQUFB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QSxFQUFBOztBQUVBLFdBQUE7QUFDQSxrQkFBQSxHQURBO0FBRUEscUJBQUEseURBRkE7QUFHQSxjQUFBLGNBQUEsS0FBQSxFQUFBO0FBQ0Esa0JBQUEsUUFBQSxHQUFBLGdCQUFBLGlCQUFBLEVBQUE7QUFDQTtBQUxBLEtBQUE7QUFRQSxDQVZBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG53aW5kb3cuYXBwID0gYW5ndWxhci5tb2R1bGUoJ0Z1bGxzdGFja0dlbmVyYXRlZEFwcCcsIFsnZnNhUHJlQnVpbHQnLCAndWkucm91dGVyJywgJ3VpLmJvb3RzdHJhcCcsICduZ0FuaW1hdGUnLCAndGltZXInLCAnTG9jYWxTdG9yYWdlTW9kdWxlJ10pO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyLCBsb2NhbFN0b3JhZ2VTZXJ2aWNlUHJvdmlkZXIsICRodHRwUHJvdmlkZXIpIHtcbiAgICAvLyBUaGlzIHR1cm5zIG9mZiBoYXNoYmFuZyB1cmxzICgvI2Fib3V0KSBhbmQgY2hhbmdlcyBpdCB0byBzb21ldGhpbmcgbm9ybWFsICgvYWJvdXQpXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuICAgIC8vIElmIHdlIGdvIHRvIGEgVVJMIHRoYXQgdWktcm91dGVyIGRvZXNuJ3QgaGF2ZSByZWdpc3RlcmVkLCBnbyB0byB0aGUgXCIvXCIgdXJsLlxuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbiAgICAvLyBUcmlnZ2VyIHBhZ2UgcmVmcmVzaCB3aGVuIGFjY2Vzc2luZyBhbiBPQXV0aCByb3V0ZVxuICAgICR1cmxSb3V0ZXJQcm92aWRlci53aGVuKCcvYXV0aC86cHJvdmlkZXInLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICB9KTtcblxuICAgIGxvY2FsU3RvcmFnZVNlcnZpY2VQcm92aWRlci5zZXRQcmVmaXgoJ2xzJyk7XG5cbiAgICAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLnVzZVhEb21haW4gPSB0cnVlO1xuICAgIGRlbGV0ZSAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWydYLVJlcXVlc3RlZC1XaXRoJ11cblxufSk7XG5cbi8vIFRoaXMgYXBwLnJ1biBpcyBmb3IgY29udHJvbGxpbmcgYWNjZXNzIHRvIHNwZWNpZmljIHN0YXRlcy5cbmFwcC5ydW4oZnVuY3Rpb24gKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgIC8vIFRoZSBnaXZlbiBzdGF0ZSByZXF1aXJlcyBhbiBhdXRoZW50aWNhdGVkIHVzZXIuXG4gICAgdmFyIGRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGggPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlLmRhdGEgJiYgc3RhdGUuZGF0YS5hdXRoZW50aWNhdGU7XG4gICAgfTtcblxuICAgIC8vICRzdGF0ZUNoYW5nZVN0YXJ0IGlzIGFuIGV2ZW50IGZpcmVkXG4gICAgLy8gd2hlbmV2ZXIgdGhlIHByb2Nlc3Mgb2YgY2hhbmdpbmcgYSBzdGF0ZSBiZWdpbnMuXG4gICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcykge1xuXG4gICAgICAgIGlmICghZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCh0b1N0YXRlKSkge1xuICAgICAgICAgICAgLy8gVGhlIGRlc3RpbmF0aW9uIHN0YXRlIGRvZXMgbm90IHJlcXVpcmUgYXV0aGVudGljYXRpb25cbiAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgICAgIC8vIFRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQuXG4gICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FuY2VsIG5hdmlnYXRpbmcgdG8gbmV3IHN0YXRlLlxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIC8vIElmIGEgdXNlciBpcyByZXRyaWV2ZWQsIHRoZW4gcmVuYXZpZ2F0ZSB0byB0aGUgZGVzdGluYXRpb25cbiAgICAgICAgICAgIC8vICh0aGUgc2Vjb25kIHRpbWUsIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpIHdpbGwgd29yaylcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgaWYgbm8gdXNlciBpcyBsb2dnZWQgaW4sIGdvIHRvIFwibG9naW5cIiBzdGF0ZS5cbiAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKHRvU3RhdGUubmFtZSwgdG9QYXJhbXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgIC8vIFJlZ2lzdGVyIG91ciAqYWJvdXQqIHN0YXRlLlxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhYm91dCcsIHtcbiAgICAgICAgdXJsOiAnL2Fib3V0JyxcbiAgICAgICAgY29udHJvbGxlcjogJ0Fib3V0Q29udHJvbGxlcicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvYWJvdXQvYWJvdXQuaHRtbCdcbiAgICB9KTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdBYm91dENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBGdWxsc3RhY2tQaWNzKSB7XG5cbiAgICAvLyBJbWFnZXMgb2YgYmVhdXRpZnVsIEZ1bGxzdGFjayBwZW9wbGUuXG4gICAgJHNjb3BlLmltYWdlcyA9IF8uc2h1ZmZsZShGdWxsc3RhY2tQaWNzKTtcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZG9jcycsIHtcbiAgICAgICAgdXJsOiAnL2RvY3MnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2RvY3MvZG9jcy5odG1sJ1xuICAgIH0pO1xufSk7XG4iLCIoZnVuY3Rpb24gKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gSG9wZSB5b3UgZGlkbid0IGZvcmdldCBBbmd1bGFyISBEdWgtZG95LlxuICAgIGlmICghd2luZG93LmFuZ3VsYXIpIHRocm93IG5ldyBFcnJvcignSSBjYW5cXCd0IGZpbmQgQW5ndWxhciEnKTtcblxuICAgIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnZnNhUHJlQnVpbHQnLCBbXSk7XG5cbiAgICBhcHAuZmFjdG9yeSgnU29ja2V0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXdpbmRvdy5pbykgdGhyb3cgbmV3IEVycm9yKCdzb2NrZXQuaW8gbm90IGZvdW5kIScpO1xuICAgICAgICByZXR1cm4gd2luZG93LmlvKHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pO1xuICAgIH0pO1xuXG4gICAgLy8gQVVUSF9FVkVOVFMgaXMgdXNlZCB0aHJvdWdob3V0IG91ciBhcHAgdG9cbiAgICAvLyBicm9hZGNhc3QgYW5kIGxpc3RlbiBmcm9tIGFuZCB0byB0aGUgJHJvb3RTY29wZVxuICAgIC8vIGZvciBpbXBvcnRhbnQgZXZlbnRzIGFib3V0IGF1dGhlbnRpY2F0aW9uIGZsb3cuXG4gICAgYXBwLmNvbnN0YW50KCdBVVRIX0VWRU5UUycsIHtcbiAgICAgICAgbG9naW5TdWNjZXNzOiAnYXV0aC1sb2dpbi1zdWNjZXNzJyxcbiAgICAgICAgbG9naW5GYWlsZWQ6ICdhdXRoLWxvZ2luLWZhaWxlZCcsXG4gICAgICAgIGxvZ291dFN1Y2Nlc3M6ICdhdXRoLWxvZ291dC1zdWNjZXNzJyxcbiAgICAgICAgc2Vzc2lvblRpbWVvdXQ6ICdhdXRoLXNlc3Npb24tdGltZW91dCcsXG4gICAgICAgIG5vdEF1dGhlbnRpY2F0ZWQ6ICdhdXRoLW5vdC1hdXRoZW50aWNhdGVkJyxcbiAgICAgICAgbm90QXV0aG9yaXplZDogJ2F1dGgtbm90LWF1dGhvcml6ZWQnXG4gICAgfSk7XG5cbiAgICBhcHAuZmFjdG9yeSgnQXV0aEludGVyY2VwdG9yJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRxLCBBVVRIX0VWRU5UUykge1xuICAgICAgICB2YXIgc3RhdHVzRGljdCA9IHtcbiAgICAgICAgICAgIDQwMTogQVVUSF9FVkVOVFMubm90QXV0aGVudGljYXRlZCxcbiAgICAgICAgICAgIDQwMzogQVVUSF9FVkVOVFMubm90QXV0aG9yaXplZCxcbiAgICAgICAgICAgIDQxOTogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsXG4gICAgICAgICAgICA0NDA6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXNwb25zZUVycm9yOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3Qoc3RhdHVzRGljdFtyZXNwb25zZS5zdGF0dXNdLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZXNwb25zZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIGFwcC5jb25maWcoZnVuY3Rpb24gKCRodHRwUHJvdmlkZXIpIHtcbiAgICAgICAgJGh0dHBQcm92aWRlci5pbnRlcmNlcHRvcnMucHVzaChbXG4gICAgICAgICAgICAnJGluamVjdG9yJyxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgkaW5qZWN0b3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJGluamVjdG9yLmdldCgnQXV0aEludGVyY2VwdG9yJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIF0pO1xuICAgIH0pO1xuXG4gICAgYXBwLnNlcnZpY2UoJ0F1dGhTZXJ2aWNlJywgZnVuY3Rpb24gKCRodHRwLCBTZXNzaW9uLCAkcm9vdFNjb3BlLCBBVVRIX0VWRU5UUywgJHEpIHtcblxuICAgICAgICBmdW5jdGlvbiBvblN1Y2Nlc3NmdWxMb2dpbihyZXNwb25zZSkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgU2Vzc2lvbi5jcmVhdGUoZGF0YS5pZCwgZGF0YS51c2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MpO1xuICAgICAgICAgICAgcmV0dXJuIGRhdGEudXNlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVzZXMgdGhlIHNlc3Npb24gZmFjdG9yeSB0byBzZWUgaWYgYW5cbiAgICAgICAgLy8gYXV0aGVudGljYXRlZCB1c2VyIGlzIGN1cnJlbnRseSByZWdpc3RlcmVkLlxuICAgICAgICB0aGlzLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAhIVNlc3Npb24udXNlcjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldExvZ2dlZEluVXNlciA9IGZ1bmN0aW9uIChmcm9tU2VydmVyKSB7XG5cbiAgICAgICAgICAgIC8vIElmIGFuIGF1dGhlbnRpY2F0ZWQgc2Vzc2lvbiBleGlzdHMsIHdlXG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIHVzZXIgYXR0YWNoZWQgdG8gdGhhdCBzZXNzaW9uXG4gICAgICAgICAgICAvLyB3aXRoIGEgcHJvbWlzZS4gVGhpcyBlbnN1cmVzIHRoYXQgd2UgY2FuXG4gICAgICAgICAgICAvLyBhbHdheXMgaW50ZXJmYWNlIHdpdGggdGhpcyBtZXRob2QgYXN5bmNocm9ub3VzbHkuXG5cbiAgICAgICAgICAgIC8vIE9wdGlvbmFsbHksIGlmIHRydWUgaXMgZ2l2ZW4gYXMgdGhlIGZyb21TZXJ2ZXIgcGFyYW1ldGVyLFxuICAgICAgICAgICAgLy8gdGhlbiB0aGlzIGNhY2hlZCB2YWx1ZSB3aWxsIG5vdCBiZSB1c2VkLlxuXG4gICAgICAgICAgICBpZiAodGhpcy5pc0F1dGhlbnRpY2F0ZWQoKSAmJiBmcm9tU2VydmVyICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLndoZW4oU2Vzc2lvbi51c2VyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTWFrZSByZXF1ZXN0IEdFVCAvc2Vzc2lvbi5cbiAgICAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSB1c2VyLCBjYWxsIG9uU3VjY2Vzc2Z1bExvZ2luIHdpdGggdGhlIHJlc3BvbnNlLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIDQwMSByZXNwb25zZSwgd2UgY2F0Y2ggaXQgYW5kIGluc3RlYWQgcmVzb2x2ZSB0byBudWxsLlxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL3Nlc3Npb24nKS50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9naW4gPSBmdW5jdGlvbiAoY3JlZGVudGlhbHMpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvbG9naW4nLCBjcmVkZW50aWFscylcbiAgICAgICAgICAgICAgICAudGhlbihvblN1Y2Nlc3NmdWxMb2dpbilcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHsgbWVzc2FnZTogJ0ludmFsaWQgbG9naW4gY3JlZGVudGlhbHMuJyB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBTZXNzaW9uLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9nb3V0U3VjY2Vzcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgIH0pO1xuXG4gICAgYXBwLnNlcnZpY2UoJ1Nlc3Npb24nLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMpIHtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubm90QXV0aGVudGljYXRlZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5pZCA9IG51bGw7XG4gICAgICAgIHRoaXMudXNlciA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5jcmVhdGUgPSBmdW5jdGlvbiAoc2Vzc2lvbklkLCB1c2VyKSB7XG4gICAgICAgICAgICB0aGlzLmlkID0gc2Vzc2lvbklkO1xuICAgICAgICAgICAgdGhpcy51c2VyID0gdXNlcjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IG51bGw7XG4gICAgICAgIH07XG5cbiAgICB9KTtcblxufSkoKTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2hvbWUnLCB7XG4gICAgICAgIHVybDogJy8nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvaG9tZS5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCRodHRwLCBIdWVGYWN0b3J5KXtcblxuICAgICAgICAgICAgJHNjb3BlLmNvbG9ycz0gT2JqZWN0LmtleXMoSHVlRmFjdG9yeS5jb2xvcnMpO1xuXG4gICAgICAgICAgICAkc2NvcGUuYWN0aXZhdGVMaWdodHM9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdmFyIGxpZ2h0cz17XG4gICAgICAgICAgICAgICAgICAgIGxpZ2h0MTogJHNjb3BlLmxpZ2h0MS5jb2xvcixcbiAgICAgICAgICAgICAgICAgICAgbGlnaHQyOiAkc2NvcGUubGlnaHQyLmNvbG9yLFxuICAgICAgICAgICAgICAgICAgICBsaWdodDM6ICRzY29wZS5saWdodDMuY29sb3JcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgSHVlRmFjdG9yeS5hY3RpdmF0ZUFsbExpZ2h0cyhsaWdodHMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkc2NvcGUubG9vcD0gSHVlRmFjdG9yeS5jb2xvckxvb3A7XG5cbiAgICAgICAgXHQkc2NvcGUuZ2xvYmFsRmVlbHM9IGZ1bmN0aW9uKCl7XG4gICAgICAgIFx0XHQkaHR0cC5nZXQoJ2h0dHA6Ly93ZWZlZWwuY3Npcm8uYXUvYXBpL2Vtb3Rpb25zL3ByaW1hcnkvdG90YWxzJylcbiAgICAgICAgXHRcdC50aGVuKGZ1bmN0aW9uKHRvdGFscyl7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdUb3RhbHM9IHRvdGFscy5kYXRhO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhuZXdUb3RhbHMpO1xuICAgICAgICBcdFx0XHR2YXIgbWF4PTA7XG4gICAgICAgIFx0XHRcdHZhciB3b3JsZEZlZWw9Jyc7XG4gICAgICAgIFx0XHRcdHZhciBjb2xvcj0gXCJcIjtcbiAgICAgICAgXHRcdFx0ZGVsZXRlIG5ld1RvdGFscy5vdGhlcjtcbiAgICAgICAgXHRcdFx0ZGVsZXRlIG5ld1RvdGFscy5zdXJwcmlzZTtcbiAgICAgICAgXHRcdFx0ZGVsZXRlIG5ld1RvdGFsc1snKiddO1xuICAgICAgICBcdFx0XHRmb3IodmFyIHByb3AgaW4gbmV3VG90YWxzKXtcbiAgICAgICAgXHRcdFx0XHRpZihuZXdUb3RhbHNbcHJvcF0gPiBtYXgpe1xuICAgICAgICBcdFx0XHRcdFx0bWF4PSBuZXdUb3RhbHNbcHJvcF07XG4gICAgICAgIFx0XHRcdFx0XHR3b3JsZEZlZWw9IHByb3A7XG4gICAgICAgIFx0XHRcdFx0fVxuICAgICAgICBcdFx0XHR9XG5cbiAgICAgICAgXHRcdFx0c3dpdGNoKHdvcmxkRmVlbCl7XG4gICAgICAgIFx0XHRcdFx0Y2FzZSAnc2FkbmVzcyc6XG5cdCAgICAgICAgXHRcdFx0XHRjb2xvcj0nTWlkbmlnaHQgQmx1ZSdcblx0ICAgICAgICBcdFx0XHRcdGJyZWFrO1xuICAgICAgICBcdFx0XHRcdGNhc2UgJ2xvdmUnOlxuXHQgICAgICAgIFx0XHRcdFx0Y29sb3I9J1NhbG1vbidcblx0ICAgICAgICBcdFx0XHRcdGJyZWFrO1xuICAgICAgICBcdFx0XHRcdGNhc2UgJ2FuZ2VyJzpcblx0ICAgICAgICBcdFx0XHRcdGNvbG9yPSdGaXJlYnJpY2snXG5cdCAgICAgICAgXHRcdFx0XHRicmVhaztcbiAgICAgICAgXHRcdFx0XHRjYXNlICdqb3knOlxuXHQgICAgICAgIFx0XHRcdFx0Y29sb3I9J1llbGxvdydcblx0ICAgICAgICBcdFx0XHRcdGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnc3VycHJpc2UnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yPSdNZWRpdW0gU3ByaW5nIEdyZWVuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBcdFx0XHRcdGNhc2UgJ2ZlYXInOlxuXHQgICAgICAgIFx0XHRcdFx0Y29sb3I9J0RhcmsgTWFnZW50YSdcblx0ICAgICAgICBcdFx0XHRcdGJyZWFrO1xuICAgICAgICBcdFx0XHR9XG4gICAgICAgICAgICAgICAgICAgIEh1ZUZhY3RvcnkuY2hhbmdlU3RhdGUoY29sb3IpO1xuXG4gICAgICAgIFx0XHR9KTtcbiAgICAgICAgXHR9XG5cbiAgICAgICAgICAgICRzY29wZS5saWdodE9mZj0gSHVlRmFjdG9yeS50dXJuTGlnaHRzT2ZmO1xuXG4gICAgICAgIH1cbiAgICB9KTtcbn0pOyIsImFwcC5mYWN0b3J5KCdIdWVGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHApe1xuXHRyZXR1cm4ge1xuXHRcdGNvbG9yczoge1wiQXF1YVwiOiBbMC4zMDg4LDAuMzIxMl0sXG4gICAgICAgICAgICAgICAgICBcIkNvcmFsXCI6IFswLjU3NjMsMC4zNDg2XSxcbiAgICAgICAgICAgICAgICAgIFwiQ3JpbXNvblwiOiBbMC42NTMxLDAuMjgzNF0sXG4gICAgICAgICAgICAgICAgICBcIkRhcmsgTWFnZW50YVwiOiBbMC4zNzg3LDAuMTcyNF0sXG4gICAgICAgICAgICAgICAgICBcIk1hcm9vblwiOiBbMC41MzgzLDAuMjU2Nl0sXG4gICAgICAgICAgICAgICAgICBcIk1pZG5pZ2h0IEJsdWVcIjogWzAuMTU4NSwwLjA4ODRdLFxuICAgICAgICAgICAgICAgICAgXCJPcmFuZ2UgUmVkXCI6IFswLjY3MjYsMC4zMjE3XSxcbiAgICAgICAgICAgICAgICAgIFwiT2xpdmVcIjogWzAuNDQzMiwwLjUxNTRdLFxuICAgICAgICAgICAgICAgICAgXCJTYWxtb25cIjogWzAuNTM0NiwwLjMyNDddLFxuICAgICAgICAgICAgICAgICAgXCJZZWxsb3dcIjogWzAuMzUxNywwLjU2MThdLFxuICAgICAgICAgICAgICAgICAgXCJNZWRpdW0gU3ByaW5nIEdyZWVuXCI6IFswLjE5MTksMC41MjRdLFxuICAgICAgICAgICAgICAgICAgXCJGaXJlYnJpY2tcIjogWzAuNjYyMSwwLjMwMjNdLFxuICAgICAgICAgICAgICAgICAgXCJEYXJrIFJlZFwiOiBbMC43LDAuMjk4Nl0sXG4gICAgICAgICAgICAgICAgICBcIkJsdWVcIjogWzAuMTM5LDAuMDgxXSxcbiAgICAgICAgICAgICAgICAgIFwiTWVkaXVtIFNwcmluZyBHcmVlblwiOiBbMC4xOTE5LDAuNTI0XVxuICAgICAgICAgICAgICB9LFxuXG5cdFx0Y2hhbmdlQ29sb3I6IGZ1bmN0aW9uKGNvbG9yKXtcblx0XHRcdCRodHRwLnB1dCgnL2FwaS9odWUnLHtcIm9uXCI6dHJ1ZSwgeHk6W3RoaXMuY29sb3JzW2NvbG9yXVswXSwgdGhpcy5jb2xvcnNbY29sb3JdWzFdXSwgXCJhbGVydFwiOiBcImxzZWxlY3RcIiwgXCJlZmZlY3RcIjogXCJub25lXCJ9KTtcblx0XHR9LFxuXG5cdFx0Y2hhbmdlU3RhdGU6IGZ1bmN0aW9uKGNvbG9yKXtcblx0XHRcdCRodHRwLnB1dCgnL2FwaS9odWUnLCB7XCJvblwiOnRydWUsIHh5Olt0aGlzLmNvbG9yc1tjb2xvcl1bMF0sIHRoaXMuY29sb3JzW2NvbG9yXVsxXV0sXCJlZmZlY3RcIjogXCJub25lXCJ9KTtcblx0XHR9LFxuXHRcdHR1cm5MaWdodHNPZmY6IGZ1bmN0aW9uKCl7XG5cdFx0XHQkaHR0cC5wdXQoJy9hcGkvaHVlJywge1wib25cIjogZmFsc2V9KTtcblx0XHR9LFxuXHRcdGFjdGl2YXRlQWxsTGlnaHRzOiBmdW5jdGlvbihsaWdodHMpe1xuXHRcdFx0bGlnaHRzLmxpZ2h0MT0gdGhpcy5jb2xvcnNbbGlnaHRzLmxpZ2h0MV07XG5cdFx0XHRsaWdodHMubGlnaHQyPSB0aGlzLmNvbG9yc1tsaWdodHMubGlnaHQyXTtcblx0XHRcdGxpZ2h0cy5saWdodDM9IHRoaXMuY29sb3JzW2xpZ2h0cy5saWdodDNdO1xuXHRcdFx0JGh0dHAucHV0KCcvYXBpL2h1ZS9hbGwnLGxpZ2h0cyk7XG5cdFx0fSxcblx0XHRjb2xvckxvb3A6IGZ1bmN0aW9uKCl7XG5cdFx0XHQkaHR0cC5wdXQoJy9hcGkvaHVlL2xvb3AnLCB7XCJvblwiOnRydWUsIHh5OlswLjY2MjEsMC4zMDIzXSxcImVmZmVjdFwiOiBcImNvbG9ybG9vcFwifSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiYmx1ZSBmbGFzaCBjYW1lIGJhY2tcIik7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0fVxuXG5cbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsb2dpbicsIHtcbiAgICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9sb2dpbi9sb2dpbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbiAgICB9KTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBBdXRoU2VydmljZSwgJHN0YXRlKSB7XG5cbiAgICAkc2NvcGUubG9naW4gPSB7fTtcbiAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuXG4gICAgJHNjb3BlLnNlbmRMb2dpbiA9IGZ1bmN0aW9uIChsb2dpbkluZm8pIHtcblxuICAgICAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuXG4gICAgICAgIEF1dGhTZXJ2aWNlLmxvZ2luKGxvZ2luSW5mbykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gJ0ludmFsaWQgbG9naW4gY3JlZGVudGlhbHMuJztcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ21lbWJlcnNPbmx5Jywge1xuICAgICAgICB1cmw6ICcvbWVtYmVycy1hcmVhJyxcbiAgICAgICAgdGVtcGxhdGU6ICc8aW1nIG5nLXJlcGVhdD1cIml0ZW0gaW4gc3Rhc2hcIiB3aWR0aD1cIjMwMFwiIG5nLXNyYz1cInt7IGl0ZW0gfX1cIiAvPicsXG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgkc2NvcGUsIFNlY3JldFN0YXNoKSB7XG4gICAgICAgICAgICBTZWNyZXRTdGFzaC5nZXRTdGFzaCgpLnRoZW4oZnVuY3Rpb24gKHN0YXNoKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnN0YXNoID0gc3Rhc2g7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBkYXRhLmF1dGhlbnRpY2F0ZSBpcyByZWFkIGJ5IGFuIGV2ZW50IGxpc3RlbmVyXG4gICAgICAgIC8vIHRoYXQgY29udHJvbHMgYWNjZXNzIHRvIHRoaXMgc3RhdGUuIFJlZmVyIHRvIGFwcC5qcy5cbiAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICAgIH1cbiAgICB9KTtcblxufSk7XG5cbmFwcC5mYWN0b3J5KCdTZWNyZXRTdGFzaCcsIGZ1bmN0aW9uICgkaHR0cCkge1xuXG4gICAgdmFyIGdldFN0YXNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL21lbWJlcnMvc2VjcmV0LXN0YXNoJykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0U3Rhc2g6IGdldFN0YXNoXG4gICAgfTtcblxufSk7IiwiYXBwLmNvbnRyb2xsZXIoJ01vZGFsSW5zdGFuY2VDdHJsJywgZnVuY3Rpb24gKCAkc2NvcGUsICRjb21waWxlLCAkdWliTW9kYWxJbnN0YW5jZSwgSHVlRmFjdG9yeSkge1xuXG4gICRzY29wZS5jb2xvcnM9IE9iamVjdC5rZXlzKEh1ZUZhY3RvcnkuY29sb3JzKTtcbiAgJHNjb3BlLmhvdXJzPTA7XG4gICRzY29wZS5taW51dGVzPTA7XG4gICRzY29wZS5zZWNvbmRzPTA7XG5cbiAgJHNjb3BlLm9rID0gZnVuY3Rpb24gKCkge1xuICAgICR1aWJNb2RhbEluc3RhbmNlLmNsb3NlKCRzY29wZS5yZXN1bHQpO1xuICB9O1xuXG4gICRzY29wZS5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgJHVpYk1vZGFsSW5zdGFuY2UuZGlzbWlzcygnY2FuY2VsJyk7XG4gIH07XG5cblxuXG4gICRzY29wZS5zZXRUaW1lcj0gZnVuY3Rpb24oKXtcbiAgICAkc2NvcGUucmVzdWx0LmNvdW50ZXI9ICgkc2NvcGUuaG91cnMqNjAgKyAkc2NvcGUubWludXRlcykqNjArJHNjb3BlLnNlY29uZHM7XG4gICAgJHNjb3BlLiRicm9hZGNhc3QoJ3RpbWVyLXN0YXJ0Jyk7XG4gICAgJHNjb3BlLm9rKCk7XG5cbiAgfVxuXG5cblxufSk7IiwiJ3VzZSBzdHJpY3QnXG5cbmFwcC5jb250cm9sbGVyKCdOb3RpZmljYXRpb25zQ29udHJvbGxlcicsICgkc2NvcGUpID0+IHtcblxuXG59KSIsIid1c2Ugc3RyaWN0J1xuXG5hcHAuY29uZmlnKCgkc3RhdGVQcm92aWRlcikgPT4ge1xuXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdub3RpZmljYXRpb25zJywge1xuICAgIHVybDogJy90aW1lcnMnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvbm90aWZpY2F0aW9ucy90ZW1wbGF0ZXMvbm90aWZpY2F0aW9ucy5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnTm90aWZpY2F0aW9uc0NvbnRyb2xsZXInLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIC8vIGFsbE9yZGVyczogKE9yZGVyc0ZhY3RvcnkpID0+IHtcbiAgICAgIC8vICAgcmV0dXJuIE9yZGVyc0ZhY3RvcnkuZ2V0QWxsKClcbiAgICAgIC8vIH0sXG4gICAgfVxuICB9KVxuXG59KTsiLCIndXNlIHN0cmljdCdcblxuYXBwLmNvbnRyb2xsZXIoJ1RpbWVyc0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsICR1aWJNb2RhbCwgJHRpbWVvdXQsIEh1ZUZhY3RvcnksIGxvY2FsU3RvcmFnZVNlcnZpY2Upe1xuXHR2YXIgdGltZXJzID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQoJ3RpbWVycycpO1xuXG5cdCRzY29wZS50aW1lcnMgPSB0aW1lcnMgfHwgW107XG5cblx0JHNjb3BlLiR3YXRjaCgndGltZXJzJywgZnVuY3Rpb24gKCkge1xuXHRcdGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KCd0aW1lcnMnLCAkc2NvcGUudGltZXJzKTtcblx0fSx0cnVlKTtcblxuXG5cdCRzY29wZS5zdGFydD0gZnVuY3Rpb24oKXtcblx0XHR2YXIgY3VycmVudFRpbWVyID0gdGhpcztcblx0XHQkc2NvcGUuJGV2YWxBc3luYygpO1xuXHRcdHRoaXMuJGJyb2FkY2FzdCgndGltZXItc3RhcnQnKTtcblx0XHR0aGlzLiRvbigndGltZXItc3RvcHBlZCcsIGZ1bmN0aW9uKCl7XG5cdFx0XHRIdWVGYWN0b3J5LmNoYW5nZUNvbG9yKGN1cnJlbnRUaW1lci50aW1lci5saWdodGNvbG9yKTtcblx0XHR9KVxuXHR9XG5cblx0JHNjb3BlLnBhdXNlPSBmdW5jdGlvbigpe1xuXHRcdHRoaXMuJGJyb2FkY2FzdCgndGltZXItc3RvcCcpO1xuXHRcdEh1ZUZhY3RvcnkudHVybkxpZ2h0c09mZigpO1xuXHR9XG5cblx0JHNjb3BlLnJlc3VtZT0gZnVuY3Rpb24oKXtcblx0XHR0aGlzLiRicm9hZGNhc3QoJ3RpbWVyLXJlc3VtZScpO1xuXHR9XG5cblx0JHNjb3BlLmRlbGV0ZT0gZnVuY3Rpb24oKXtcblx0XHR2YXIgbGFiZWw9IHRoaXMudGltZXIubGFiZWw7XG5cdFx0dmFyIGluZGV4O1xuXHRcdCRzY29wZS50aW1lcnMuZm9yRWFjaChmdW5jdGlvbih0aW1lciwgaSl7XG5cdFx0XHRpZih0aW1lci5sYWJlbD09PSBsYWJlbCl7XG5cdFx0XHRcdGluZGV4PWk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0JHNjb3BlLnRpbWVycy5zcGxpY2UoaW5kZXgsIDEpXG5cblx0fVxuXG5cdCRzY29wZS5saWdodE9mZj0gZnVuY3Rpb24oKXtcblx0XHRIdWVGYWN0b3J5LnR1cm5MaWdodHNPZmYoKTtcblx0fVxuXG5cblxuXHQkc2NvcGUub3BlbiA9IGZ1bmN0aW9uICgpIHtcblx0ICB2YXIgbW9kYWxJbnN0YW5jZSA9ICR1aWJNb2RhbC5vcGVuKHtcblx0ICBcdGFuaW1hdGlvbjogJHNjb3BlLmFuaW1hdGlvbnNFbmFibGVkLFxuXHQgICAgdGVtcGxhdGVVcmw6ICcuL2pzL21vZGFsV2luZG93L21vZGFsVGltZXIuaHRtbCcsXG5cdCAgICBzY29wZTogJHNjb3BlLFxuXHQgICAgY29udHJvbGxlcjogJ01vZGFsSW5zdGFuY2VDdHJsJ1xuXHQgIH0pO1xuXG5cdCAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG5cdCAgXHQkc2NvcGUudGltZXJzLnB1c2gocmVzdWx0KTtcblx0ICB9KTtcblx0fTtcblxuXG59KVxuXG4iLCIndXNlIHN0cmljdCdcblxuYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcil7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCd0aW1lcnMnLCB7XG4gICAgdXJsOiAnL3RpbWVycycsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy90aW1lcnMvdGVtcGxhdGVzL3RpbWVycy5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnVGltZXJzQ29udHJvbGxlcidcbiAgfSlcblxufSk7IiwiYXBwLmZhY3RvcnkoJ0Z1bGxzdGFja1BpY3MnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CN2dCWHVsQ0FBQVhRY0UuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vZmJjZG4tc3Bob3Rvcy1jLWEuYWthbWFpaGQubmV0L2hwaG90b3MtYWsteGFwMS90MzEuMC04LzEwODYyNDUxXzEwMjA1NjIyOTkwMzU5MjQxXzgwMjcxNjg4NDMzMTI4NDExMzdfby5qcGcnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItTEtVc2hJZ0FFeTlTSy5qcGcnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I3OS1YN29DTUFBa3c3eS5qcGcnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItVWo5Q09JSUFJRkFoMC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I2eUl5RmlDRUFBcWwxMi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFLVQ3NWxXQUFBbXFxSi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFdlpBZy1WQUFBazkzMi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFZ05NZU9YSUFJZkRoSy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFUXlJRE5XZ0FBdTYwQi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NDRjNUNVFXOEFFMmxHSi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NBZVZ3NVNXb0FBQUxzai5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NBYUpJUDdVa0FBbElHcy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NBUU93OWxXRUFBWTlGbC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItT1FiVnJDTUFBTndJTS5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I5Yl9lcndDWUFBd1JjSi5wbmc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I1UFRkdm5DY0FFQWw0eC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I0cXdDMGlDWUFBbFBHaC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0IyYjMzdlJJVUFBOW8xRC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0J3cEl3cjFJVUFBdk8yXy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0JzU3NlQU5DWUFFT2hMdy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NKNHZMZnVVd0FBZGE0TC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NJN3d6akVWRUFBT1BwUy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NJZEh2VDJVc0FBbm5IVi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NHQ2lQX1lXWUFBbzc1Vi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NJUzRKUElXSUFJMzdxdS5qcGc6bGFyZ2UnXG4gICAgXTtcbn0pO1xuIiwiYXBwLmZhY3RvcnkoJ1JhbmRvbUdyZWV0aW5ncycsIGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBnZXRSYW5kb21Gcm9tQXJyYXkgPSBmdW5jdGlvbiAoYXJyKSB7XG4gICAgICAgIHJldHVybiBhcnJbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYXJyLmxlbmd0aCldO1xuICAgIH07XG5cbiAgICB2YXIgZ3JlZXRpbmdzID0gW1xuICAgICAgICAnSGVsbG8sIHdvcmxkIScsXG4gICAgICAgICdBdCBsb25nIGxhc3QsIEkgbGl2ZSEnLFxuICAgICAgICAnSGVsbG8sIHNpbXBsZSBodW1hbi4nLFxuICAgICAgICAnV2hhdCBhIGJlYXV0aWZ1bCBkYXkhJyxcbiAgICAgICAgJ0lcXCdtIGxpa2UgYW55IG90aGVyIHByb2plY3QsIGV4Y2VwdCB0aGF0IEkgYW0geW91cnMuIDopJyxcbiAgICAgICAgJ1RoaXMgZW1wdHkgc3RyaW5nIGlzIGZvciBMaW5kc2F5IExldmluZS4nLFxuICAgICAgICAn44GT44KT44Gr44Gh44Gv44CB44Om44O844K244O85qeY44CCJyxcbiAgICAgICAgJ1dlbGNvbWUuIFRvLiBXRUJTSVRFLicsXG4gICAgICAgICc6RCcsXG4gICAgICAgICdZZXMsIEkgdGhpbmsgd2VcXCd2ZSBtZXQgYmVmb3JlLicsXG4gICAgICAgICdHaW1tZSAzIG1pbnMuLi4gSSBqdXN0IGdyYWJiZWQgdGhpcyByZWFsbHkgZG9wZSBmcml0dGF0YScsXG4gICAgICAgICdJZiBDb29wZXIgY291bGQgb2ZmZXIgb25seSBvbmUgcGllY2Ugb2YgYWR2aWNlLCBpdCB3b3VsZCBiZSB0byBuZXZTUVVJUlJFTCEnLFxuICAgIF07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBncmVldGluZ3M6IGdyZWV0aW5ncyxcbiAgICAgICAgZ2V0UmFuZG9tR3JlZXRpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBnZXRSYW5kb21Gcm9tQXJyYXkoZ3JlZXRpbmdzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbn0pO1xuIiwiYXBwLmRpcmVjdGl2ZSgnZnVsbHN0YWNrTG9nbycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL2Z1bGxzdGFjay1sb2dvL2Z1bGxzdGFjay1sb2dvLmh0bWwnXG4gICAgfTtcbn0pOyIsImFwcC5kaXJlY3RpdmUoJ25hdmJhcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgQVVUSF9FVkVOVFMsICRzdGF0ZSkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgc2NvcGU6IHt9LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuaHRtbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSkge1xuXG4gICAgICAgICAgICBzY29wZS5pdGVtcyA9IFtcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnTGlnaHRzJywgc3RhdGU6ICdob21lJyB9LFxuICAgICAgICAgICAgICAgIHtsYWJlbDogJ1RpbWVycycsIHN0YXRlOiAndGltZXJzJ30sXG4gICAgICAgICAgICAgICAge2xhYmVsOiAnTm90aWZpY2F0aW9ucycsIHN0YXRlOiAnbm90aWZpY2F0aW9ucyd9XG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBzY29wZS51c2VyID0gbnVsbDtcblxuICAgICAgICAgICAgc2NvcGUuaXNMb2dnZWRJbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UubG9nb3V0KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgc2V0VXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSB1c2VyO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHJlbW92ZVVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IG51bGw7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzZXRVc2VyKCk7XG5cbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcywgc2V0VXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzLCByZW1vdmVVc2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCByZW1vdmVVc2VyKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG59KTtcbiIsImFwcC5kaXJlY3RpdmUoJ3JhbmRvR3JlZXRpbmcnLCBmdW5jdGlvbiAoUmFuZG9tR3JlZXRpbmdzKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL3JhbmRvLWdyZWV0aW5nL3JhbmRvLWdyZWV0aW5nLmh0bWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcbiAgICAgICAgICAgIHNjb3BlLmdyZWV0aW5nID0gUmFuZG9tR3JlZXRpbmdzLmdldFJhbmRvbUdyZWV0aW5nKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
