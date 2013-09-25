define(function (require, exports, module) {

    var idb = require('data/idb'),
        tagGroupRepo = require('data/tag-group-repository'),
        dbKey = 'bookmark';
    module.exports = {
        create: function (bookmark, tags, op) {
            var me = this;

            if (tags) {
                tagGroupRepo.add(tags, {
                    success: function (tagGroup) {
                        bookmark.tagGroupId = tagGroup.id;
                        me.add(bookmark, op);
                    },
                    failure: op.failure
                })
            } else {
                me.add(bookmark, op);
            }
        },
        add: function (bookmark, op) {
            var me = this;

            if (bookmark.tags) {
                tagGroupRepo.add(bookmark.tags, {
                    success: function (tagGroup) {
                        bookmark.tagGroupId = tagGroup.id;
                        delete bookmark.tags;
                        idb.add(dbKey, bookmark, 'url', op);
                    },
                    failure: op.failure
                })
            } else {
                idb.add(dbKey, bookmark, 'url', op);
            }

        },
        addAll: function (bookmarks, op) {
            var me = this,
                i = 0,
                len = bookmarks.length,
                errorCount = 0;

            function addNext() {
                if (i < len) {
                    me.add(bookmarks[i], {
                        success: function () {
                            ++i;
                            addNext();
                        },
                        failure: function () {
                            errorCount++;
                        }
                    });
                } else {   // complete
                    if (errorCount === 0) {
                        op.success();
                    } else {
                        op.failure();
                    }
                }
            }

            addNext();
        },
        remove: function (id, op) {
            idb.db[dbKey].remove(id, op);
        },
        findByKey: function (key, value, op) {
            idb.findAllByKey(dbKey, key, value, op);
        },
        findByTitle: function (keywords, op) {
            var lowercaseKeywords = _.map(keywords, function (keyword) {
                    return keyword.toLowerCase();
                }),
                keywordCount = keywords.length;

            idb.findAll(dbKey, function (bookmark) {
                var matchedCount = 0,
                    title = bookmark.title.toLowerCase();
                _.each(lowercaseKeywords, function (keyword) {
                    if (title.indexOf(keyword) !== -1) {
                        matchedCount++;
                    }
                });
                return keywordCount === matchedCount;
            }, op);
        },
        update: function (bookmark, op) {
            idb.update(dbKey, bookmark, op);
        },
        updateTags: function (bookmark, newTags, op) {
            tagGroupRepo.findExact(newTags, {
                success: function (results) {
                    bookmark.tagGroupId = results[0].id;
                    idb.update(dbKey, bookmark, op);
                },
                failure: function () {
                }
            })
        },
        each: function (fn, op) {
            idb.db[dbKey]
                .query()
                .filter(function (item) {
                    fn(item);
                    return false;
                })
                .execute()
                .done(op.success)
                .fail(op.failure);
        }
    };

});




