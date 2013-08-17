var idb = require('data/idb'),
    dbKey = 'tagGroup';

module.exports = {
    create: function (tags, op) {
        idb.create(dbKey, {tags: tags}, op);
    },
    add: function (tags, op) {
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
    update: function (groupId, newTags) {
    }
};
