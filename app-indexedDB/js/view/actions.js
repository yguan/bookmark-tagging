var bookmarkLoader = require('data/bookmark-loader'),
    idb = require('data/idb'),
    fileSaver = require('lib/FileSaver');

function hideMsgAfterward($scope) {
    setTimeout(function () {
        $scope.alerts = [];
        $scope.$apply();
    }, 2000);
}

module.exports = {
    name: 'ActionsCtrl',
    controller: function($scope, $location) {
        var loadBookmarksOp = {
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
            },
            exportOp = {
                success: function (msg) {
                    $scope.alerts = [{ type: 'success', msg: msg || 'Exported bookmarks successfully.' }];
                    $scope.exportBtn.disabled = false;
                    $scope.$apply();
                    hideMsgAfterward($scope);
                },
                failure: function (msg) {
                    $scope.alerts = [{ type: 'error', msg: msg || 'Failed to export bookmarks.' }];
                    $scope.$apply();
                }
            };

        $scope.alerts = [];
        $scope.loadBtn = { disabled: false };
        $scope.exportBtn = { disabled: false };
        $scope.uploadBookmarkVisible = false;

        $scope.go = function (path) {
            $location.path(path);
        };

        $scope.loadBookmarks = function () {
            $scope.loadBtn.disabled = true;
            $scope.alerts = [{ type: 'info', msg: 'Loading bookmarks from Chrome' }];
            if (chrome.bookmarks) {
                // for chrome extension
                bookmarkLoader.loadBookmarksFromChrome(loadBookmarksOp);
            } else {
                // for regular web page
                require(['data/bookmarks-json'], function(chromeBookmarks) {
                    bookmarkLoader.loadChromeBookmarks(chromeBookmarks.bookmarks[0].children[0].children, loadBookmarksOp);
                });
            }
        };

        $scope.exportDB = function () {
            $scope.exportBtn.disabled = true;
            $scope.alerts = [{ type: 'info', msg: 'Exporting bookmarks' }];
            idb.export({
                success: function (data) {
                    var blog = new Blob([JSON.stringify(data)], {type: 'text/plain;charset=utf-8'})
                    fileSaver.saveAs(blog, 'bookmarks.json');
                    exportOp.success();
                }
            }, exportOp);
        };

        $scope.showUpload = function() {
            $scope.uploadBookmarkVisible = true;
        };

//        $scope.onFileSelect = function (content, completed) {
//            var op = {
//                success: function (results) {
//                    if (results.length > 0) {
//                        $scope.alerts = [{ type: 'success', msg: 'Loaded bookmarks successfully.' }];
//                        $scope.$apply();
//                    } else {
//                        op.failure();
//                    }
//                },
//                failure: function (error) {
//                    $scope.alerts = [{ type: 'error', msg: 'Failed to load bookmarks' }];
//                    $scope.$apply();
//                }
//            };
//            if (completed && content.length > 0) {
//                var data = JSON.parse(content); // Presumed content is a json string!
//                idb.db.add(data.tagGroup, op);
//                idb.db.add(data.bookmark, op);
//            }
//        };

        $scope.onFileSelect = function ($files) {
            $scope.alerts = [{ type: 'info', msg: 'Loading bookmarks.' }];

            var reader = new FileReader(),
                file = $files[0],
                blob = file.slice(0, file.size);

            reader.onload = function() {
                var result = reader.result,
                    errorCount = 0,
                    operationCount = 0,
                    totalOperationCount = 2,
                    op = {
                        success: function (results) {
                            operationCount++;
                            if (errorCount ===  0 && operationCount === totalOperationCount) {
                                $scope.uploadBookmarkVisible = false;
                                $scope.alerts = [{ type: 'success', msg: 'Loaded bookmarks successfully.' }];
                                $scope.$apply();
                                hideMsgAfterward($scope);
                            }
                        },
                        failure: function (error) {
                            operationCount++;
                            errorCount++;
                            $scope.alerts = [{ type: 'error', msg: 'Failed to load bookmarks' }];
                            $scope.$apply();
                        }
                    };

                if (result.length > 0) {
                    var data = JSON.parse(result); // Presumed content is a json string!

                    idb.addAll('tagGroup', data.tagGroup, op);
                    idb.addAll('bookmark', data.bookmark, op);

//                    _.each(data.tagGroup, function (tagGroup) {
//                        idb.db['tagGroup'].add(tagGroup).done(op.success).fail(op.failure);
//                    });
//
//                    _.each(data.tagGroup, function (bookmark) {
//                        idb.db['bookmark'].add(bookmark).done(op.success).fail(op.failure);
//                    });
                }
            };
            reader.readAsText(blob);
        };


        $scope.addAlert = function() {
            $scope.alerts.push({msg: "Another alert!"});
        };

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };
    }
};

