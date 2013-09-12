var bookmarkRepo = require('data/bookmark-repository'),
    tagGroupRepo = require('data/tag-group-repository'),
    getTitleTemplate = function () {
        var template = '<div class="ngCellText"><a href="{url}" title="{url}" target="_blank">{title}</a></div>';
        return template.replace(/{url}/g, '{{row.getProperty(\'url\')}}').replace('{title}', '{{row.getProperty(col.field)}}');
    },
    cellTemplate = {
        dateAdded: '<div class="ngCellText">{{row.getProperty(col.field).toLocaleDateString()}}</div>',
        title: getTitleTemplate()
    };

module.exports = {
    name: 'SearchTabCtrl',
    controller: function($scope, $location) {

        var tagGroupCache = {},
            queryStringTags = $location.search().tags;

        tagGroupRepo.getAll({
            success: function (tagGroups) {
                _.each(tagGroups, function (tagGroup) {
                    tagGroupCache[tagGroup.id] = tagGroup.tags.join(', ');
                })
            }
        });

        $scope.getTags = function () {
            return tagGroupRepo.getAllTags();
        };

        $scope.go = function (path) {
            $location.path(path);
        };

        $scope.keywords = [];
        $scope.gridData = [];
        $scope.keywordType = 'tag';

        $scope.gridOptions = {
            data: 'gridData',
            enableCellSelection: false,
            enableRowSelection: false,
            enableCellEditOnFocus: false,
            enableColumnResize: true,
            columnDefs: [
                {field: 'title', displayName: 'Title', width: 650, cellTemplate: cellTemplate.title},
                {field: 'dateAdded', displayName: 'Date Added', width: 100, cellTemplate: cellTemplate.dateAdded},
                {field: 'tags', displayName: 'Tags'}
            ]
        };

        function searchTags() {
            $scope.gridData = [];

            tagGroupRepo.findAll($scope.keywords, {
                success: function (tagGroups) {
                    _.each(tagGroups, function (tagGroup) {
                        bookmarkRepo.findByKey('tagGroupId', tagGroup.id, {
                            success: function (bookmarks) {
                                _.each(bookmarks, function (bookmark) {
                                    bookmark.tags = tagGroupCache[bookmark.tagGroupId];
                                });

                                $scope.gridData = _.uniq(_.union($scope.gridData, bookmarks), 'id');
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
                    $scope.gridData = _.uniq(_.union($scope.gridData, bookmarks), 'id');
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

        if (queryStringTags){
            $scope.keywords = queryStringTags.split(', ');
        }
    }
};

