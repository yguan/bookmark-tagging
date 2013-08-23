var idb = require('data/idb'),
    dbKey = 'tagGroup';

module.exports = {
    create: function (tags, op) {
        idb.create(dbKey, {tags: tags}, op);
    },
    add: function (tags, op) {
        this.addTagsToCache(tags);
        idb.add(dbKey, {tags: tags}, 'tags', op);
    },
    findAll: function (tags, op) {
        var filterFn = function (tagGroup) {
            return (_.intersection(tags, tagGroup.tags).length === tags.length);
        };

        idb.findAll(dbKey, filterFn, op);
    },
    findExact: function (tags, op) {
        idb.findExact(dbKey, 'tags', tags, op);
    },
    update: function (tagGroup, op) {
        idb.update(dbKey, tagGroup, op);
    },
    getAllTags: function () {
        return Object.keys(this.allTagsCache);
    },
    allTagsCache: {},
    addTagsToCache: function (tags) {
        var me = this,
            i,
            len;
        for (i = 0, len = tags.length; i < len; i++) {
            if (!me.allTagsCache[tags[i]]) {
                me.allTagsCache[tags[i]] = true;
            }
        }
    },
    loadAllTagsToCache: function (op, reload) {
        if (Object.keys(this.allTagsCache).length === 0 || reload) {
            var me = this;
            idb.each(dbKey, function (tagGroup) {
                me.addTagsToCache(tagGroup.tags);
            }, op);
        }
    }
};
