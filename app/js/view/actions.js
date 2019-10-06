define(function (require, exports, module) {

    var bookmarkLoader = require('data/bookmark-loader'),
        idb = require('data/idb'),
        bookmarkRepo = require('data/bookmark-repository'),
        fileSaver = require('lib/FileSaver'),
        tab = require('view/tab');

    function hideMsgAfterward($scope) {
        setTimeout(function () {
            $scope.alerts = [];
            $scope.$apply();
        }, 2000);
    }

    exports.name = 'ActionsCtrl';

    exports.controller = function ($scope, $location) {
        var loadBookmarksOp = {
                success: function (msg) {
                    $scope.alerts = [
                        { type: 'success', msg: msg || 'Loaded bookmarks successfully.' }
                    ];
                    $scope.loadBtn.disabled = false;
                    $scope.$apply();
                    hideMsgAfterward($scope);
                },
                failure: function (msg) {
                    $scope.alerts = [
                        { type: 'error', msg: msg || 'Failed to load all bookmarks.' }
                    ];
                    $scope.$apply();
                }
            },
            exportOp = {
                success: function (msg) {
                    $scope.alerts = [
                        { type: 'success', msg: msg || 'Exported bookmarks successfully.' }
                    ];
                    $scope.exportBtn.disabled = false;
                    $scope.$apply();
                    hideMsgAfterward($scope);
                },
                failure: function (msg) {
                    $scope.alerts = [
                        { type: 'error', msg: msg || 'Failed to export bookmarks.' }
                    ];
                    $scope.$apply();
                }
            };

        $scope.alerts = [];
        $scope.loadBtn = { disabled: false };
        $scope.exportBtn = { disabled: false };
        $scope.uploadBookmarkVisible = false;

        $scope.go = function (url) {
            $location.url(url);
        };

        $scope.openNewTab = function (path) {
            tab.openInNewTab(path);
        };

        $scope.loadBookmarks = function () {
            $scope.loadBtn.disabled = true;
            $scope.alerts = [
                { type: 'info', msg: 'Loading bookmarks from Chrome' }
            ];
            if (chrome.bookmarks) {
                // for chrome extension
                bookmarkLoader.loadBookmarksFromChrome(loadBookmarksOp);
            }
//            else {
//                // for regular web page
//                require(['data/bookmarks-json'], function(chromeBookmarks) {
//                    bookmarkLoader.loadChromeBookmarks(chromeBookmarks.bookmarks[0].children[0].children, loadBookmarksOp);
//                });
//            }
        };

        $scope.exportDB = function () {
            $scope.exportBtn.disabled = true;
            $scope.alerts = [
                { type: 'info', msg: 'Exporting bookmarks' }
            ];
            idb.export({
                success: function (data) {
                    var blog = new Blob([JSON.stringify(data)], {type: 'text/plain;charset=utf-8'})
                    fileSaver.saveAs(blog, 'bookmarks.json');
                    exportOp.success();
                }
            }, exportOp);
        };

        $scope.showUpload = function () {
            $scope.uploadBookmarkVisible = true;
        };

        $scope.onFileSelect = function ($files) {
            $scope.alerts = [
                { type: 'info', msg: 'Loading bookmarks.' }
            ];

            let reader = new FileReader(),
                file = $files[0],
                blob = file.slice(0, file.size);

            reader.onload = function () {
                let result = reader.result,
                    tagsLookup = {};

                if (result.length === 0) return;

                console.log(result);

                let data = JSON.parse(result);

                _.each(data.tagGroup, function (tagGroup) {
                    tagsLookup[tagGroup.id] = tagGroup.tags;
                });

                _.each(data.bookmark, function (bookmark) {
                    bookmark.tags = tagsLookup[bookmark.tagGroupId];
                    bookmark.dateAdded = new Date(bookmark.dateAdded);
                });

                bookmarkRepo.addAll(data.bookmark, {
                    success: function (results) {
                        $scope.uploadBookmarkVisible = false;
                        $scope.alerts = [
                            { type: 'success', msg: 'Loaded bookmarks successfully.' }
                        ];
                        $scope.$apply();
                        hideMsgAfterward($scope);
                    },
                    failure: function (error) {
                        $scope.alerts = [
                            { type: 'error', msg: 'Failed to load bookmarks' }
                        ];
                        $scope.$apply();
                    }
                });
            };
            reader.readAsText(blob);
        };


        $scope.addAlert = function () {
            $scope.alerts.push({msg: "Another alert!"});
        };

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };
    };

});
