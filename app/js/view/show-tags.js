define(function (require, exports, module) {

    var bookmarkRepo = require('data/bookmark-repository'),
        tagGroupRepo = require('data/tag-group-repository'),
        tab = require('view/tab'),
        getTagsTemplate = function () {
            var template = '<div class="ngCellText"><a href ng-click="searchWithTags(row.getProperty(\'tagsStrWithoutSpace\'))">{{{tags}}}</a></div>';
            return template.replace(/{tags}/g, 'row.getProperty(col.field)');
        },
        getCountTemplate = '<div class="ngCellText bookmark-count">' +
            '<div class="left">{{row.getProperty(col.field)}}</div>' +
            '<div class="glyphicon glyphicon-remove icon-delete right" ng-hide="row.getProperty(col.field) > 0" ng-click="delete()" title="delete"></div>' +
            '</div>';

    exports.name = 'ShowTagsCtrl';
    exports.controller = function ($scope, $location) {
        var tagGroupsCache = [];

        $scope.go = function (url) {
            $location.url(url);
        };

        $scope.searchWithTags = function (tags) {
            var url = '/search?tags=' + encodeURIComponent(tags);
            $location.url(url);
        };

        $scope.getTags = function () {
            return tagGroupRepo.getAllTags();
        };

        $scope.keywords = [];
        $scope.gridData = [];

        $scope.gridOptions = {
            data: 'gridData',
            enableCellSelection: false,
            enableRowSelection: false,
            enableCellEditOnFocus: false,
            enableColumnResize: false,
            columnDefs: [
                {field: 'bookmarkCount', displayName: 'Bookmarks', width: 90, cellTemplate: getCountTemplate},
                {field: 'tagsStr', displayName: 'Tags', cellTemplate: getTagsTemplate()}
            ],
            sortInfo: {fields: ['tagsStr'], directions: ['asc']}
        };

        tagGroupRepo.getAll({
            success: function (tagGroups) {
                tagGroupsCache = tagGroups;

                _.each(tagGroupsCache, function (tagGroup) {
                    tagGroup.tagsStr = tagGroup.tags.join(', ');
                    tagGroup.tagsStrWithoutSpace = tagGroup.tags.join(',');
                    tagGroup.bookmarkCount = 0;
                });

                var tagGroupLookup = _.mapToLookup(tagGroupsCache, 'id');

                bookmarkRepo.each(function (bookmark) {
                    tagGroupLookup[bookmark.tagGroupId].bookmarkCount++;
                }, {
                    success: function () {
                        $scope.gridData = tagGroupsCache;
                        $scope.$apply();
                    },
                    failure: console.log
                })
            }
        });

        $scope.$watch('keywords', function (newValue, oldValue) {
            if (newValue.length && newValue.length > 0) {
                $scope.gridData = _.filter(tagGroupsCache, function (tagGroup) {
                    return _.in(newValue, tagGroup.tags);
                });
            } else {
                $scope.gridData = tagGroupsCache;
            }
        }, true);

        $scope.delete = function() {
            var id = this.row.orig.entity.id;
            index = _.findIndex($scope.gridData, function (item) {
                return item.id === id;
            });
            tagGroupRepo.remove(id);
            $scope.gridData.splice(index, 1);
        };
    };

});