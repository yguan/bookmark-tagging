var idb = require('data/idb');

module.exports = {
    create: function (tags, op) {
        idb.db.tagGroup.add({tags: tags}).done(op.success).fail(op.failure);
    },
    add: function (tags, op) {
        this.findExact(tags, {
            success: function (results) {
                if (results && results.length === 1) {
                    op.success(results[0]);
                } else {
                    this.create(tags, op);
                }
            },
            failure: op.failure
        });
    },
    findAll: function (tags, op) {
        idb.db.tagGroup
            .query()
            .filter(function (tagGroup) {
                return (_.intersection(tags, tagGroup.tags).length === tags.length);
            })
            .execute()
            .done(op.success)
            .fail(op.failure);
    },
    findExact: function (tags, op) {
        idb.db.tagGroup.query('tags').only(tags).execute().done(op.success).fail(op.failure);
    },
    update: function (groupId, newTags) {
        tagGroupDB({id: groupId}).update({tags: newTags});
        return tagGroupDB({id: groupId}).first();
    }
};
