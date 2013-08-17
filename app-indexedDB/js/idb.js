var db = require('./lib/db'),
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
                    tagGroup: {
                        key: {
                            keyPath: 'id',
                            autoIncrement: true
                        },
                        indexes: {
                            tags: { unique: true }
                        }
                    }
//                    ,
//                    bookmark: {
//                        key: {
//                            keyPath: 'id',
//                            autoIncrement: true
//                        },
//                        indexes: {
//                            title: { },
//                            tagGroupId: { unique: true }
//                        }
//                    }
                }
            })
            .done(function (dbInstance) {
                    me.db = dbInstance;
                op.onSuccess();
            })
            .fail(op.onFailure);
        },
        db: null
    };

module.exports = idb;

