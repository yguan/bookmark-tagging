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
                            title: {},
                            url: {},
                            dateAdded: {},
                            tagGroupId: {}
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
                op && op.success && op.success(dbInstance);
            })
            .fail(function (error) {
                op && op.failure && op.failure(error);
            });
        },
        db: null,
        create: function (dbKey, item, op) {
            idb.db[dbKey].add(item).done(op.success).fail(op.failure);
        },
        add: function (dbKey, item, uniqueItemKey, op) {
            var me = this;

            me.findExact(dbKey, uniqueItemKey, item[uniqueItemKey], {
                success: function (results) {
                    if (results && results.length > 0) {
                        op.success(results[0]);
                    } else {
                        me.create(dbKey, item, op);
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
        findAllByKey: function (dbKey, key, value, op) {
            idb.db[dbKey]
                .query(key)
                .only(value)
                .execute()
                .done(op.success)
                .fail(op.failure);
        },
        findExact: function (dbKey, key, value, op) {
            idb.db[dbKey].query(key).only(value).execute().done(op.success).fail(op.failure);
        },
        update: function (dbKey, item, op) {
            idb.db[dbKey]
                .update( item )
                .done(op.success)
                .fail(op.failure);
        },
        each: function (dbKey, eachFn, op) {
            idb.db[dbKey]
                .query()
                .filter(function (item) {
                    eachFn(item);
                    return false;
                })
                .execute()
                .done(op.success)
                .fail(op.failure);
        }
    };

module.exports = idb;

