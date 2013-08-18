var bookmarkLoader = require('view/chrome-action');

function registerController(module, name, controller) {
    module.controller(name, ['$scope', '$dialog', controller]);
}

module.exports = {
    init: function () {
        angular.element(document).ready(function() {
            var bookmarkModule = angular.module('bookmark', ['ui.bootstrap']);

            registerController(bookmarkModule, bookmarkLoader.name, bookmarkLoader.controller);

            angular.bootstrap(document, ['bookmark']);
        });
    }
}