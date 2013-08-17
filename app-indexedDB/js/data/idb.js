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
        db: null
    };

module.exports = idb;

