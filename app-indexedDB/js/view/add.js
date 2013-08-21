var bookmarkRepo = require('data/bookmark-repository'),
    tagGroupRepo = require('data/tag-group-repository');

module.exports = {
    name: 'AddCtrl',
    controller: function($scope) {

        tagGroupRepo.loadAllTagsToCache({});

        $scope.getTags = function () {
            return tagGroupRepo.getAllTags();
        };

        $scope.save = function () {

        };

        $scope.remove = function () {

        };
    }
};

