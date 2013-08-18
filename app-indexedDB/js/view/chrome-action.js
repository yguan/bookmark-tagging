var bookmarkLoader = require('data/bookmark-loader');

module.exports = {
    name: 'ActionButtonsCtrl',
    controller: function($scope) {
        var op = {
            success: function (msg) {
                $scope.alerts = [{ type: 'success', msg: msg || 'Loaded bookmarks successfully.' }];
            },
            failure: function (msg) {
                $scope.alerts = [{ type: 'error', msg: msg || 'Failed to load all bookmarks.' }];
            }
        }

        $scope.alerts = [];

        $scope.loadBookmarks = function () {
            if (chrome.bookmarks) {
                // for chrome extension
                bookmarkLoader.loadBookmarksFromChrome(op);
            } else {
                // for regular web page
                require(['data/bookmarks-json'], function(chromeBookmarks) {
                    bookmarkLoader.loadChromeBookmarks(chromeBookmarks.bookmarks[0].children[0].children, op);
                });
            }
        }

        $scope.addAlert = function() {
            $scope.alerts.push({msg: "Another alert!"});
        };

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };
    }
};

