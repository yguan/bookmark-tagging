var idb = require('data/idb'),
    tagGroupRepo = require('data/tag-group-repository'),
    bookmarkRepo = require('data/bookmark-repository'),
    bookmarkParser = require('data/chrome-bookmark-parser');

function loadBookmarks(bookmarkTreeNodes, op) {
    var results = bookmarkParser.parseChromeBookmarks(bookmarkTreeNodes),
        bookmarks = results.bookmarks;

    _.each(bookmarks, function (bookmark) {
        bookmark.tags = _.map(bookmark.tags, function(str){ return str.toLowerCase(); });
        bookmark.dateAdded = new Date(bookmark.dateAdded);
    });

    bookmarkRepo.addAll(bookmarks, op);
}

module.exports = {
    /**
     * init should be called first and wait for loadIndexedDB completed before calling other methods
     */
    init: function (op) {
        idb.loadIndexedDB({
            success: function () {
                tagGroupRepo.loadAllTagsToCache(op);
            }
        });
    },
    loadChromeBookmarks: function (bookmarkTreeNodes, op) {
        loadBookmarks(bookmarkTreeNodes, op);
    },
    loadBookmarksFromChrome: function (op) {
        chrome.bookmarks.getTree(function (tree) {
            loadBookmarks(tree[0].children, op);
        });
    }
};
