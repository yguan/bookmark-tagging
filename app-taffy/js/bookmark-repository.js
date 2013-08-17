var Taffy = require('./lib/taffy').taffy,
    bookmarkDB = Taffy(),
    tagGroupRepo = require('./tag-group-repository');

module.exports = {
    create: function (bookmark) {
        bookmarkDB.insert(bookmark);
    },
    add: function (bookmark) {
        var existingBookmark = this.find(bookmark.title, bookmark.url);
        if (existingBookmark) {
            return existingBookmark;
        }

        bookmarkDB.insert(bookmark);
        return this.find(bookmark.title, bookmark.url);
    },
    find: function (title, url) {
        return bookmarkDB({title: title}, {url: url}).first();
    },
    get: function (id) {
        return _bookmarkDB(id).first();
    },
    update: function (bookmark) {
        var group = tagGroupRepo.addTagGroup(bookmark.tags);
        bookmarkDB(bookmark.___id).update({title: bookmark.title}, {url: bookmark.url}, {tagGroupId: group.id});
        return this.get(bookmark.___id);
    }
};
