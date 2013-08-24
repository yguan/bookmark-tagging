var bookmarkRepo = require('data/bookmark-repository'),
    tagGroupRepo = require('data/tag-group-repository'),
    cellTemplate = {
        url: '<a href="{{row.getProperty(col.field)}}" target="_blank">{{row.getProperty(col.field)}}</a>'
    } ;

module.exports = {
    name: 'SearchCtrl',
    controller: function($scope, $location) {

        tagGroupRepo.loadAllTagsToCache({});

        $scope.getTags = function () {
            return tagGroupRepo.getAllTags();
        };

        $scope.go = function (path) {
            $location.path(path);
        };

        $scope.gridData = [];

        $scope.gridOptions = {
            data: 'gridData',
            enableCellSelection: true,
            enableRowSelection: false,
            enableCellEditOnFocus: false,
            columnDefs: [
                {field: 'title', displayName: 'Title'},
                {field: 'url', displayName: 'Link', cellTemplate: cellTemplate.url }
            ]
        };

        $scope.searchTags = function () {
            $scope.gridData = [];

            tagGroupRepo.findAll($scope.selectedTags, {
                success: function (tagGroups) {
                    _.each(tagGroups, function (tagGroup) {
                        bookmarkRepo.findByKey('tagGroupId', tagGroup.id, {
                            success: function (bookmarks) {
                                $scope.gridData = $scope.gridData.concat(bookmarks);
                                $scope.$apply();
                            },
                            failure: function (results) {
                                console.log(results);
                            }
                        });
                    });

                }
            })
        };

        $scope.searchTitles = function () {
            $scope.gridData = [];

            bookmarkRepo.findByTitle($scope.selectedTags, {
                success: function (bookmarks) {
                    $scope.gridData = $scope.gridData.concat(bookmarks);
                    $scope.$apply();
                },
                failure: function (results) {
                    console.log(results);
                }
            })
        };
    }
};

