var idb = require('./idb');

module.exports = {
    create: function (tags, op) {
        idb.tagGroup.add({tags: tags}).done(op.onSuccess).fail(op.onFailure);
    },
    add: function (tags, op) {
        this.findExact(tags, {
            onSuccess: function (item) {
                if (item) {
                    op.onSuccess(item);
                } else {
                    this.create(tags, op);
                }
            },
            onFailure: op.onFailure
        });
    },
    findAll: function (tags, op) {
        idb.tagGroup
            .query()
            .filter(function (tagGroup) {
                return _.intersection(tags, tagGroup.tags).length === tags.length;
            })
            .execute()
            .done(op.onSuccess)
            .fail(op.onFailure);
    },
    findExact: function (tags, op) {
        idb.tagGroup.query('indexName').only('tags', tags).execute().done(op.onSuccess).fail(op.onFailure);
    },
    update: function (groupId, newTags) {
        tagGroupDB({id: groupId}).update({tags: newTags});
        return tagGroupDB({id: groupId}).first();
    }
};
