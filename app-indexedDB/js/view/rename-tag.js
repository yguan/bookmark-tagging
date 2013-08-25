var tagGroupRepo = require('data/tag-group-repository'),
    alerts = require('view/alerts');

module.exports = {
    name: 'RenameTagCtrl',
    controller: function($scope, $location) {

        tagGroupRepo.loadAllTagsToCache({});

        $scope.getTags = function () {
            return tagGroupRepo.getAllTags();
        };

        $scope.oldTag = '';
        $scope.newTag = '';
        $scope.renameBtn = { disabled: false };

        $scope.isUnchanged = function(newTag) {
            return newTag.length === 0;
        };

        $scope.go = function (path) {
            $location.path(path);
        };

        $scope.closeAlert = function() {
            alerts.close($scope);
        };

        $scope.rename = function () {
            $scope.renameBtn.disabled = true;
            alerts.show($scope, {
                type: alerts.type.info,
                msg: 'Renaming tag'
            });

            tagGroupRepo.rename($scope.oldTag.toLowerCase(), $scope.newTag.toLowerCase(), {
                success: function () {
                    $scope.oldTag = '';
                    $scope.newTag = '';
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
    }
};

