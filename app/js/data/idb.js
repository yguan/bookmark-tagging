define(function (require, exports, module) {

    var db = require('lib/db'),
        idb = {
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
            },
            loadIndexedDB: function (op) {
                var me = this;

                if (me.db) {
                    return;
                }
                db.open({
                    server: 'app-db',
                    version: 1,
                    schema: me.schema
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
            get: function (dbKey, id, op) {
                idb.db[dbKey]
                    .get(id)
                    .done(function (item){
                        op.success(item);
                    })
                    .fail(op.failure);
            },
            create: function (dbKey, item, op) {
                idb.db[dbKey].add(item).done(function (results) {
                    op.success(results[0]);
                }).fail(op.failure);
            },
            add: function (dbKey, item, uniqueItemKey, op) {
                var me = this;

                me.findExact(dbKey, uniqueItemKey, item[uniqueItemKey], {
                    success: function (results) {
                        if (results && results.length > 0) {
                            var oldItem = results[0];
                            _.extend(oldItem, item)
                            me.update(dbKey, oldItem, {
                                success: function (results) {
                                    op.success(results[0]);
                                },
                                failure: op.failure
                            });
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
            },
            getAll: function (dbkey, op) {
                idb.db[dbkey]
                    .query()
                    .all()
                    .execute()
                    .done(op.success)
                    .fail(op.failure);
            },
            export: function (op) {
                var dbKeys = Object.keys(this.schema),
                    data = {},
                    dbKeysCount = dbKeys.length,
                    dataKeyCount = 0,
                    addData = function (key, items) {
                        data[key] = items;
                        dataKeyCount++;

                        if (dbKeysCount === dataKeyCount) {
                            op.success(data);
                        }
                    };

                _.each(dbKeys, function (key) {
                    idb.db[key]
                        .query()
                        .all()
                        .execute()
                        .done(function (items) {
                            addData(key, items);
                        }).fail(op.failure);
                });
            },
//        addAll: function (dbKey, items, uniqueKey, op) {
//            var me = this,
//                i = 0,
//                len = items.length;
//
//            function addNext() {
//                if (i < len) {
//                    me.add(dbKey, items[i], uniqueKey, {
//                        success: function () {
//                            ++i;
//                            addNext();
//                        },
//                        failure: function () {
//                            op.failure();
//                        }
//                    });
//                } else {   // complete
//                    op.success();
//                }
//            }
//            addNext();
//        },
            updateAll: function (dbKey, items, op) {
                var i = 0,
                    len = items.length,
                    db = idb.db[dbKey];

                function updateNext() {
                    if (i < len) {
                        db.update(items[i]).done(function () {
                            ++i;
                            updateNext();
                        }).fail(op.failure);
                    } else {   // complete
                        op.success();
                    }
                }
                updateNext();
            }
        };

    module.exports = idb;

});
