var app = angular.module('pillager', [
    'pillager.services', 
    'pillager.auth',
    'pillager.graph',
    'pillager.tag',
    'pillager.add',
    'pillager.tree',
    'ngRoute'
])

//frontend routing and redirects using ngRoute
.config(function ($routeProvider, $httpProvider) {
  $routeProvider
    .when('/signin', {
    	templateUrl: 'auth/signin.html',
    	controller: 'AuthController',
        requiresLogin: false
    })
    .when('/signup', {
    	templateUrl: 'auth/signup.html',
    	controller: 'AuthController',
        requiresLogin: false
    })
    .when('/main', {
      templateUrl: 'main/main.html',
      controller: 'AuthController',
      requiresLogin: true
    })
    .when('/graph', {
      templateUrl: 'bookmarks/graph/graph.html',
      controller: 'GraphController',
      requiresLogin: true
    })
    .when('/tag', {
      templateUrl: 'bookmarks/tag/tag.html',
      controller: 'TagController',
      requiresLogin: true
    })
    .when('/tree', {
      templateUrl: 'bookmarks/tree/tree.html',
      controller: 'TreeController',
      requiresLogin: true,
    })
    .when('/add', {
        templateUrl:'add/add.html',
        controller: 'AddController',
        requiresLogin: true
    })
    .otherwise({
    	redirectTo: '/signin'
    });

    $httpProvider.interceptors.push('AuthInterceptor');
})
.factory('AuthInterceptor', function ($window) {
  return {
    request: function (object) {
      var token = $window.localStorage.getItem('jwt');
      if (token) {
        object.headers['x-access-token'] = token;
      }
      object.headers['Allow-Control-Allow-Origin'] = '*';
      return object;
    }
  };
})
.run(function ($rootScope, $location, Authenticate) {
  $rootScope.$on('$routeChangeStart', function (event, next, current) {
    if(next.$$route && next.$$route.requiresLogin && !Authenticate.isAuthed()) {
      $location.path('/signin');
    }
  });
});