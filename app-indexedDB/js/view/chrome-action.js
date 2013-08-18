var bookmarkLoader = require('data/bookmark-loader'),
    msgBox;

function showMsg($dialog, msg){
    var msg = 'This is the content of the message box';
    msgBox = $dialog.messageBox('', msg, []);
    msgBox.open();
}

function hideMsg() {
    msgBox.close();
}

module.exports = {
    name: 'ActionButtonsCtrl',
    controller: function($scope, $dialog) {
        var op = {
            success: function (msg) {
                $scope.alerts = [{ type: 'success', msg: msg || 'Loaded bookmarks successfully.' }];
                hideMsg();
            },
            failure: function (msg) {
                $scope.alerts = [{ type: 'error', msg: msg || 'Failed to load all bookmarks.' }];
                hideMsg();
            }
        }

        $scope.alerts = [];

        $scope.loadBookmarks = function () {
            showMsg($dialog, 'Loading bookmarks from Chrome...');
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

