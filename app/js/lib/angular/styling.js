angular.module('styling', [])
    .directive('resize', ['$window', function ($window) {
        return function (scope, element) {

            var w = angular.element($window);
            scope.getWindowDimensions = function () {
                return { 'h': w.height(), 'w': w.width() };
            };
            scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
                scope.windowHeight = newValue.h;
                scope.windowWidth = newValue.w;
            }, true);

            w.bind('resize', function () {
                scope.$apply();
            });
        }
    }]);