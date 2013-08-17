var db = require('./lib/db');

module.exports = {
    loadIndexedDB: function () {
        if (this.db) {
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
                },
                bookmark: {
                    key: {
                        keyPath: 'id',
                        autoIncrement: true
                    },
                    indexes: {
                        title: { },
                        tagGroupId: { unique: true }
                    }
                }
            }
        }).done(function (dbInstance) {
            this.db = dbInstance;
        });
    },
    db: null
};

module.exports.loadIndexedDB();