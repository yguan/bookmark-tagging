define(function (require, exports, module) {

    var bookmarkRepo = require('data/bookmark-repository'),
        tagGroupRepo = require('data/tag-group-repository'),
        tab = require('view/tab');

    exports.name = 'AddCtrl';

    exports.controller = function ($scope, $location) {

        function getUrlWithTags (url) {
            return url + '?tags=' + $scope.selectedTags.join(',');
        }

        function getActiveTab() {
            if (chrome.tabs && chrome.tabs.query) {
                chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
                    // since only one tab should be active and in the current window at once
                    // the return variable should only have one entry
                    var activeTab = arrayOfTabs[0],
                        url = activeTab.url;

                    $scope.url = url;
                    $scope.title = activeTab.title;
                    $scope.$apply();

                    bookmarkRepo.findByKey('url', url, {
                        success: function (results) {
                            var bookmark = results[0];

                            if (results.length > 0) {
                                $scope.title = bookmark.title;

                                tagGroupRepo.get(bookmark.tagGroupId, {
                                    success: function (tagGroup) {
                                        $scope.selectedTags = tagGroup.tags;
                                        $scope.$apply();
                                    }
                                })
                            }
                        }
                    });
                });
            } else {
                $scope.url = window.location.href;
                $scope.title = window.document.title;
            }
        }

        getActiveTab();

        $scope.getTags = function () {
            return tagGroupRepo.getAllTags();
        };

        $scope.title = '';
        $scope.url = '';
        $scope.selectedTags = [];
        $scope.isSaving = false;

        $scope.isSaveBtnDisabled = function (title, url, selectedTags, isSaving) {
            return title.length === 0 || url.length === 0 || selectedTags.length === 0 || isSaving;
        };

        $scope.go = function (url) {
            $location.url(url);
        };

        $scope.goWithTags = function (url) {
            $location.url(getUrlWithTags(url));
        };

        $scope.openNewTab = function (url) {
            tab.openInNewTab(getUrlWithTags(url));
        };

        $scope.save = function () {
            $scope.isSaving = true;

            var tags = _.map($scope.selectedTags, function (str) {
                return str.toLowerCase();
            });
            tagGroupRepo.add(tags, {
                success: function (tagGroup) {
                    bookmarkRepo.add({
                        title: $scope.title,
                        url: $scope.url,
                        dateAdded: new Date(),
                        tagGroupId: tagGroup.id
                    }, {
                        success: function () {
                            window.close();
                        },
                        failure: function (results) {
                            console.log(results);
                        }
                    });
                }
            })
        };
    };
});
