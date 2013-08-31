var bookmarkRepo = require('data/bookmark-repository'),
    tagGroupRepo = require('data/tag-group-repository'),
    tab = require('view/tab'),
    cellTemplate = {
        url: '<div class="ngCellText"><a href="{{row.getProperty(col.field)}}" target="_blank">{{row.getProperty(col.field)}}</a></div>'
    };

module.exports = {
    name: 'SearchCtrl',
    controller: function($scope, $location) {

        $scope.getTags = function () {
            return tagGroupRepo.getAllTags();
        };

        $scope.go = function (path) {
            $location.path(path);
        };

        $scope.openNewTab = function (path) {
            tab.openInNewTab(path);
        };

        $scope.keywords = [];
        $scope.gridData = [];
        $scope.tags = {
            selected: []
        };

        $scope.keywordType = 'tag';

        $scope.gridOptions = {
            data: 'gridData',
            enableCellSelection: true,
            enableRowSelection: false,
            enableCellEditOnFocus: false,
            enableColumnResize: true,
            columnDefs: [
                {field: 'title', displayName: 'Title', width: 580},
                {field: 'url', displayName: 'Link', cellTemplate: cellTemplate.url}
            ]
        };

        function searchTags() {
            $scope.gridData = [];

            tagGroupRepo.findAll($scope.keywords, {
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
        }

        function searchTitles() {
            $scope.gridData = [];

            bookmarkRepo.findByTitle($scope.keywords, {
                success: function (bookmarks) {
                    $scope.gridData = $scope.gridData.concat(bookmarks);
                    $scope.$apply();
                },
                failure: function (results) {
                    console.log(results);
                }
            })
        }

        function search() {
            var hasKeyword = $scope.keywords.length > 0;

            if (hasKeyword) {
                if ($scope.keywordType === 'tag') {
                    searchTags();
                } else {
                    searchTitles();
                }
            } else if ($scope.gridData.length > 0) {
                $scope.gridData = [];
            }
        }

        $scope.$watch('keywords', function(newValue, oldValue) {
            search();
        },true);

        $scope.$watch('keywordType', function(newValue, oldValue) {
            search();
        },true);
    }
};

