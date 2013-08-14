require('./lib/lodash.underscore');

var loader = require('./bookmark-loader'),
    chromeBookmarks = require('./bookmarks-json').bookmarks;

module.exports = {
    run: function () {
        loader.loadChromeBookmarks(chromeBookmarks[0].children[0].children);
        console.log(loader.tagGroupRepo.findAll(['Ideas']));
    }
};
