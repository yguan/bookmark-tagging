var idb = require('data/idb'),
    tagGroupRepo = require('data/tag-group-repository'),
    dbKey = 'bookmark';

module.exports = {
    create: function (bookmark, tags, op) {
        if (tags) {
            tagGroupRepo.add(tags, {
                success: function (tagGroup) {
                    bookmark.tagGroupId = tagGroup.id;
                    idb.create(dbKey, bookmark, op);
                },
                failure: function (error) {
                    console.log(error);
                }
            })
        } else {
            idb.create(dbKey, bookmark, op);
        }
    },
    add: function (bookmark, op) {
        idb.add(dbKey, bookmark, 'url', op);
    },
    findByKey: function (key, value, op) {
        idb.findAllByKey(dbKey, key, value, op);
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
            failure: function () {}
        })
    }
};
