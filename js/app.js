require('./lib/lodash.underscore');

var bookmarkRepo = require('./bookmark-repository'),
    tagGroupRepo = require('./tag-group-repository');

module.exports = {
    run: function () {
        tagGroupRepo.add(['invest']);
        var a = tagGroupRepo.findAll(['invest']);
    }
};
