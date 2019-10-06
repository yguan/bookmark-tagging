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

    function linkInfo(link) {
        let info = {};

        let url = link.getAttribute('href');
        if(url) info.url = url;

        let title = link.innerText;
        if(title) info.title = title;

        let dateAdded = link.getAttribute('add_date');
        if(dateAdded) {
            let date = new Date(parseInt(dateAdded) * 1000);
            info.dateAdded = date.toISOString();
        }

        return info;
    }

    function linkTags(link) {
        let tagList = link.getAttribute('tags');

        return tagList ? tagList.split(',') : [];
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
                let result = "" + reader.result,
                    tagsLookup = {};

                if (result.length === 0) return;
                let data = {};

                switch(file.type) {
                    case 'application/json':
                        data = JSON.parse(result);
                        break;
                    case 'text/html':
                        let i, l;
                        let dom = new DOMParser();
                        let doc = dom.parseFromString(result, file.type);

                        let links = doc.getElementsByTagName('a');
                        if(!links || !links.length) {
                            $scope.alerts = [
                                { type: 'info', msg: 'No links found' }
                            ];
                            $scope.$apply();
                            return;
                        }

                        data.tagGroup = [];
                        data.bookmark = [];

                        let groupSet = new Set();
                        for(i = 0, l = links.length; i < l; i++) {
                            let tags = linkTags(links[i]);
                            groupSet.add(tags);
                        }

                        i = 1;
                        groupSet.forEach((el) => {
                            let tag = {};
                            tag.tags = el;
                            tag.id = i;
                            data.tagGroup.push(tag);
                            el.value = i;
                            i++;
                        });

                        for(i = 0, l = links.length; i < l; i++) {
                            let info = linkInfo(links[i]);
                            let tags = JSON.stringify(linkTags(links[i]));
                            let tagId = 0;
                            groupSet.forEach((el) => {
                                let v = el.value;
                                delete el.value;
                                if(JSON.stringify(el) === tags) {
                                    tagId = v;
                                    return false;
                                }
                            });
                            if(tagId) info.tagGroupId = tagId;
                            data.bookmark.push(info);
                        }
                        break;
                    default:
                        $scope.alerts = [
                            { type: 'danger', msg: 'Unsupported file format' }
                        ];
                        $scope.$apply();
                        return;
                }

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
                            { type: 'danger', msg: 'Failed to load bookmarks' }
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
