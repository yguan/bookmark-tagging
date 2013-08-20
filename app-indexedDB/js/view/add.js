module.exports = {
    name: 'AddCtrl',
    controller: function($scope) {
        $scope.selectedTags = ['a'];

        $scope.getTags = function () {
            return ['ui', 'tag'];
        };
    }
};

