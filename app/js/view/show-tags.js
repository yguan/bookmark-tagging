var tagGroupRepo = require('data/tag-group-repository'),
    tab = require('view/tab'),
    getTagsTemplate = function () {
        var template = '<div class="ngCellText"><a href="javascript:void(0)" ng-click="searchWithTags({tags})">{{{tags}}}</a></div>';
        return template.replace(/{tags}/g, 'row.getProperty(col.field)');
    };

module.exports = {
    name: 'ShowTagsCtrl',
    controller: function ($scope, $location) {

        $scope.go = function (url) {
            $location.url(url);
        };

        $scope.searchWithTags = function (tags) {
            var url = '/search?tags=' + tags;
            $location.url(url);
        };

        $scope.gridData = [];

        $scope.gridOptions = {
            data: 'gridData',
            enableCellSelection: false,
            enableRowSelection: false,
            enableCellEditOnFocus: false,
            enableColumnResize: true,
            columnDefs: [
                {field: 'tags', displayName: 'Tags', cellTemplate: getTagsTemplate()}
            ],
            sortInfo: {fields: ['tags'], directions: ['asc']}
        };

        tagGroupRepo.getAll({
            success: function (tagGroups) {
                _.each(tagGroups, function (tagGroup) {
                    tagGroup.tags = tagGroup.tags.join(', ');
                });
                $scope.gridData = tagGroups;
                $scope.$apply();
            }
        });
    }
};

