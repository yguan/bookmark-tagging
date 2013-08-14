var Taffy = require('./lib/taffy').taffy,
    tagGroupDB = Taffy(),
    GROUPID_PREFIX = 'g';

module.exports = {
    create: function (tags) {
        var id = _.uniqueId(GROUPID_PREFIX);
        tagGroupDB.insert({id: id, tags: tags});
        return tagGroupDB({id: id}).first();
    },
    add: function (tags) {
        var group = this.findExact(tags);
        return group ? group : this.create(tags);
    },
    findAll: function (tags) {
        var groups = [];
        tagGroupDB().each(function (record,recordnumber) {
            if (_.intersection(tags, record['tags']).length === tags.length) {
                groups.push(record);
            }
        });
        return groups;
    },
    findExact: function (tags) {
        var group,
            groupTags;

        tagGroupDB().each(function (record,recordnumber) {
            groupTags = record.tags;
            if (!group && tags.length === groupTags.length && _.intersection(tags, groupTags).length === tags.length) {
                group = record;
            }
        });
        return group;
    },
    exist: function (tags) {
        return this.findTagGroups(tags).length > 0;
    },
    update: function (groupId, newTags) {
        tagGroupDB({id: groupId}).update({tags: newTags});
        return tagGroupDB({id: groupId}).first();
    }
};
