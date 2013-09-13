var tagGroupRepo = require('data/tag-group-repository'),
    alerts = require('view/alerts');

module.exports = {
    name: 'RenameTagCtrl',
    controller: function($scope, $location) {

        var queryStringTags = $location.search().tags

        $scope.getTags = function () {
            return tagGroupRepo.getAllTags();
        };

        $scope.oldTags = [];
        $scope.newTags = [];
        $scope.renameBtn = { disabled: false };

        $scope.isUnchanged = function(oldTags, newTags) {
            return oldTags.length === 0 || newTags.length === 0;
        };

        $scope.go = function (url) {
            $location.url(url);
        };

        $scope.closeAlert = function() {
            alerts.close($scope);
        };

        $scope.rename = function () {
            $scope.renameBtn.disabled = true;
            alerts.show($scope, {
                type: alerts.type.info,
                msg: 'Renaming tags'
            });

            tagGroupRepo.rename(_.toLowerCase($scope.oldTags), _.toLowerCase($scope.newTags), {
                success: function () {
                    $scope.oldTags = [];
                    $scope.newTags = [];
                    alerts.show($scope, {
                        type: alerts.type.success,
                        msg: 'Renamed successfully',
                        hideAfterward: true
                    });
                    $scope.$apply();
                },
                failure: function (results) {
                    alerts.show($scope, {
                        type: alerts.type.error,
                        msg: 'Failed to rename',
                        withApply: true
                    });
                }
            })
        };

        if (queryStringTags){
            $scope.oldTags = queryStringTags.split(',');
        }
    }
};

