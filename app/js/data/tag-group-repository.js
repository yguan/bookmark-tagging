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
    addAll: function (tagGroups, op) {
        var me = this,
            i = 0,
            len = tagGroups.length,
            errorCount = 0;

        function addNext() {
            if (i < len) {
                me.add(tagGroups[i].tags, {
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
    },
    get: function (id, op) {
        idb.get(dbKey, id, op);
    },
    rename: function (oldTag, newTag, op) {
        var me = this,
            i,
            len,
            cache = me.allTagsCache,
            updateTagGroup = function (tagGroups) {
                _.each(tagGroups, function (tagGroup) {
                    tagGroup.tags[_.indexOf(tagGroup.tags, oldTag)] = newTag;
                });
            };

        delete cache[oldTag];
        cache[newTag] = true;

        idb.findAll(dbKey, function (tagGroup) {
            return _.contains(tagGroup.tags, oldTag);
        }, {
            success: function (tagGroups) {
                updateTagGroup(tagGroups);
                idb.updateAll(dbKey, tagGroups, op);
            },
            failure: op.failure
        });
    }
};
