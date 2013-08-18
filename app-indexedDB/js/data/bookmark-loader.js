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
            var tags = bookmark.tags;
            delete bookmark.tags;
            bookmarkRepo.create(bookmark, tags, {
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
        tagGroupRepo.add(tags,{
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
    loadChromeBookmarks: function (bookmarkTreeNodes, op) {
        idb.loadIndexedDB({
            success: function () {
                loadBookmarks(bookmarkTreeNodes, op);
            },
            failure: op.failure
        });
    },
    loadBookmarksFromChrome: function (op) {
        idb.loadIndexedDB({
            success: function () {
                chrome.bookmarks.getTree(function (tree) {
                    loadBookmarks(tree[0].children[0].children, op);
                });
            },
            failure: op.failure
        });
    },
    bookmarkRepo: bookmarkRepo,
    tagGroupRepo: tagGroupRepo
};
