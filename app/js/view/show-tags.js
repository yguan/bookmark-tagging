var tagGroupRepo = require('data/tag-group-repository'),
    tab = require('view/tab'),
    getTagsTemplate = function () {
        var template = '<div class="ngCellText"><a href="javascript:void(0)" ng-click="searchWithTags({tags})">{{{tags}}}</a></div>';
        return template.replace(/{tags}/g, 'row.getProperty(col.field)');
    };

module.exports = {
    name: 'ShowTagsCtrl',
    controller: function ($scope, $location) {
        var tagGroupsCache = [];

        $scope.go = function (url) {
            $location.url(url);
        };

        $scope.searchWithTags = function (tags) {
            var url = '/search?tags=' + tags;
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
            enableColumnResize: true,
            columnDefs: [
                {field: 'tagsStr', displayName: 'Tags', cellTemplate: getTagsTemplate()}
            ],
            sortInfo: {fields: ['tagsStr'], directions: ['asc']}
        };

        tagGroupRepo.getAll({
            success: function (tagGroups) {
                _.each(tagGroups, function (tagGroup) {
                    tagGroup.tagsStr = tagGroup.tags.join(', ');
                });
                tagGroupsCache = tagGroups;
                $scope.gridData = tagGroups;
                $scope.$apply();
            }
        });

        $scope.$watch('keywords', function(newValue, oldValue) {
            if (newValue.length && newValue.length > 0) {
                $scope.gridData = _.filter(tagGroupsCache, function (tagGroup) {
                    return _.in(newValue, tagGroup.tags);
                });
            } else {
                $scope.gridData = tagGroupsCache;
            }
        },true);
    }
};

