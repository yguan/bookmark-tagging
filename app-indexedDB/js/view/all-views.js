var bookmarkLoader = require('view/chrome-action');

function registerController(app, name, controller) {
    app.controller(name, ['$scope', '$dialog', controller]);
}

function configViewRouting(app) {
    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/bookmark-manager', {templateUrl: '/js/view/bookmark-manager.html', controller: 'UsersCtrl'})
            .when('/bookmark-popup', {templateUrl: '/js/view/bookmark-popup.html', controller: 'ActionButtonsCtrl'})
            .otherwise({redirectTo: '/bookmark-popup'});
    }]);
}

module.exports = {
    init: function () {
        angular.element(document).ready(function() {
            var bookmarkApp = angular.module('bookmark', ['ui.bootstrap']);

            configViewRouting(bookmarkApp);
            registerController(bookmarkApp, bookmarkLoader.name, bookmarkLoader.controller);

            angular.bootstrap(document, ['bookmark']);
        });
    }
}