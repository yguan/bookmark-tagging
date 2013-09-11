var tagGroupRepo = require('data/tag-group-repository'),
    getTagsTemplate = function () {
        var template = '<div class="ngCellText"><a href="{url}" target="_blank">{tags}</a></div>',
            url = location.origin + location.pathname + '#/search-tab?tags={tags}';

        return template.replace('{url}', url).replace(/{tags}/g, '{{row.getProperty(col.field)}}');
    };

module.exports = {
    name: 'ShowTagsCtrl',
    controller: function ($scope, $location) {

        $scope.gridData = [];

        $scope.gridOptions = {
            data: 'gridData',
            enableCellSelection: true,
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

