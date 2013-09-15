define(function (require, exports, module) {

    exports.type = {
        success: 'success',
        error: 'error',
        info: 'info'
    };

    exports.hideMsgAfterward = function ($scope) {
        setTimeout(function () {
            $scope.alerts = [];
            $scope.$apply();
        }, 2000);
    };

    exports.show = function ($scope, config) {
        $scope.alerts = [
            { type: config.type, msg: config.msg }
        ];

        if (config.withApply) {
            $scope.$apply();
        }

        if (config.hideAfterward) {
            this.hideMsgAfterward($scope);
        }
    };

    exports.close = function ($scope) {
        $scope.alerts.splice(0, 1);
    };

});
