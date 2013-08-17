var db = require('lib/db'),
    idb = {
        loadIndexedDB: function (op) {
            var me = this;

            if (me.db) {
                return;
            }
            db.open({
                server: 'app-db',
                version: 1,
                schema: {
                    bookmark: {
                        key: {
                            keyPath: 'id',
                            autoIncrement: true
                        },
                        indexes: {
                            title: { },
                            dateAdded: {},
                            tagGroupId: { unique: true }
                        }
                    },
                    tagGroup: {
                        key: {
                            keyPath: 'id',
                            autoIncrement: true
                        },
                        indexes: {
                            tags: { unique: true }
                        }
                    }
                }
            })
            .done(function (dbInstance) {
                    me.db = dbInstance;
                op.success();
            })
            .fail(op.failure);
        },
        db: null,
        create: function (dbKey, item, op) {
            idb.db[dbKey].add(item).done(op.success).fail(op.failure);
        },
        add: function (dbKey, item, uniqueItemKey, op) {
            this.findExact(item[uniqueItemKey], {
                success: function (results) {
                    if (results && results.length === 1) {
                        op.success(results[0]);
                    } else {
                        this.create(item, op);
                    }
                },
                failure: op.failure
            });
        },
        findAll: function (dbKey, filterFn, op) {
            idb.db[dbKey]
                .query()
                .filter(filterFn)
                .execute()
                .done(op.success)
                .fail(op.failure);
        },
        findExact: function (dbKey, key, value, op) {
            idb.db[dbKey].query(key).only(value).execute().done(op.success).fail(op.failure);
        },
        update: function (groupId, newTags) {
            tagGroupDB({id: groupId}).update({tags: newTags});
            return tagGroupDB({id: groupId}).first();
        }
    };

module.exports = idb;

