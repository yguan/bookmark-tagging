var bookmarkLoader = require('data/bookmark-loader');

function hideMsgAfterward($scope) {
    setTimeout(function () {
        $scope.alerts = [];
        $scope.$apply();
    }, 2000);
}

module.exports = {
    name: 'ActionsCtrl',
    controller: function($scope, $location) {
        var op = {
            success: function (msg) {
                $scope.alerts = [{ type: 'success', msg: msg || 'Loaded bookmarks successfully.' }];
                $scope.loadBtn.disabled = false;
                $scope.$apply();
                hideMsgAfterward($scope);
            },
            failure: function (msg) {
                $scope.alerts = [{ type: 'error', msg: msg || 'Failed to load all bookmarks.' }];
                $scope.$apply();
            }
        }

        $scope.alerts = [];
        $scope.loadBtn ={
            disabled: false
        };

        $scope.go = function (path) {
            $location.path(path);
        };

        $scope.loadBookmarks = function () {
            $scope.loadBtn.disabled = true;
            $scope.alerts = [{ type: 'info', msg: 'Loading bookmarks from Chrome' }];
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

