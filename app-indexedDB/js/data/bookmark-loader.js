var idb = require('data/idb'),
    bookmarkRepo = require('data/bookmark-repository'),
    tagGroupRepo = require('data/tag-group-repository'),
    bookmarkParser = require('data/chrome-bookmark-parser');

//findTagGroup(['Ideas']);
window.findTagGroup = function (tags) {
    tagGroupRepo.findAll(tags, {
        success: function (results) {
            console.log(results);
        },
        failure: function (r) {
            console.log(r);
        }
    });
    tagGroupRepo.findExact(tags, {
        success: function (results) {
            console.log(results);
        },
        failure: function (r) {
            console.log(r);
        }
    });
}

function loadBookmarks(bookmarkTreeNodes, op) {
    var results = bookmarkParser.parseChromeBookmarks(bookmarkTreeNodes),
        bookmarks = results.bookmarks,
        tagGroups = results.tagGroups,
        newBookmarkCount = bookmarks.length,
        newTagGroupCount = tagGroups.length,
        persistedTagGroupCount = 0,
        persistedBookmarkCount = 0;

    function persistBookmarks() {
        _.each(bookmarks, function (bookmark) {
            var lowercaseTags = _.map(bookmark.tags, function(str){ return str.toLowerCase(); });
            delete bookmark.tags;
            bookmarkRepo.create(bookmark, lowercaseTags, {
                success: function () {
                    persistedBookmarkCount++;
                    if (persistedBookmarkCount === newBookmarkCount) {
                        op.success();
                    }
                },
                failure: op.failure
            });
        });
    }
    _.each(tagGroups, function (tags) {
        var lowercaseTags = _.map(tags, function(str){ return str.toLowerCase(); });
        tagGroupRepo.add(lowercaseTags,{
            success: function () {
                persistedTagGroupCount++;
                if (persistedTagGroupCount === newTagGroupCount) {
                    persistBookmarks();
                }
            }
        })
    });
}

module.exports = {
    /**
     * init should be called first and wait for loadIndexedDB completed before calling other methods
     */
    init: function () {
        idb.loadIndexedDB();
    },
    loadChromeBookmarks: function (bookmarkTreeNodes, op) {
        loadBookmarks(bookmarkTreeNodes, op);
    },
    loadBookmarksFromChrome: function (op) {
        chrome.bookmarks.getTree(function (tree) {
            loadBookmarks(tree[0].children[0].children, op);
        });
    },
    bookmarkRepo: bookmarkRepo,
    tagGroupRepo: tagGroupRepo
};
