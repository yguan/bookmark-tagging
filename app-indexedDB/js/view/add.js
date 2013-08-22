var bookmarkRepo = require('data/bookmark-repository'),
    tagGroupRepo = require('data/tag-group-repository');

module.exports = {
    name: 'AddCtrl',
    controller: function($scope, $location) {

        tagGroupRepo.loadAllTagsToCache({});

        $scope.getTags = function () {
            return tagGroupRepo.getAllTags();
        };

        $scope.save = function () {
            tagGroupRepo.add($scope.selectedTags, {
                success: function (tagGroup) {
                    bookmarkRepo.add({
                        title: $scope.title,
                        url: $scope.url,
                        dateAdded: new Date(),
                        tagGroupId: tagGroup.id
                    }, {
                        success: function () {
                            $location.path('/actions');
                        },
                        failure: function (results) {
                            console.log(results);
                        }
                    });

                }
            })
        };

        $scope.remove = function () {

        };
    }
};

