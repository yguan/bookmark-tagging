var actions = require('view/actions');

function registerController(app, name, controller) {
    app.controller(name, ['$scope', '$dialog', controller]);
}

function configViewRouting(app) {
    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/bookmark-manager', {templateUrl: '/js/view/bookmark-manager.html', controller: 'UsersCtrl'})
            .when('/actions', {templateUrl: '/js/view/actions.html', controller: 'ActionsCtrl'})
            .otherwise({redirectTo: '/actions'});
    }]);
}

module.exports = {
    init: function () {
        angular.element(document).ready(function() {
            var bookmarkApp = angular.module('bookmark', ['ui.bootstrap']);

            configViewRouting(bookmarkApp);
            registerController(bookmarkApp, actions.name, actions.controller);

            angular.bootstrap(document, ['bookmark']);
        });
    }
}