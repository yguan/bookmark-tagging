var bookmarkRepo = require('./bookmark-repository'),
    tagGroupRepo = require('./tag-group-repository');

function loadChromeBookmarks(bookmarkTreeNodes, tagGroup) {
    var node,
        i,
        len,
        tags,
        newTagGroup,
        newTags;

    for(i=0, len = bookmarkTreeNodes.length; i < len; i++) {
        node = bookmarkTreeNodes[i];

        if (node.url) {
            bookmarkRepo.create({tagGroupId: tagGroup && tagGroup.id, title: node.title, url: node.url});
        } else {
            tags = (tagGroup && tagGroup.tags) || [];
            newTags = _.clone(tags);
            newTags.push(node.title);
            newTagGroup = tagGroupRepo.create(newTags);

            if(node.children) {
                loadChromeBookmarks(node.children, newTagGroup);
            }
        }
    }
}

module.exports = {
    //loadBookmark(bookmarks[0].children[0].children, null)
    loadChromeBookmarks: function (bookmarkTreeNodes) {
        loadChromeBookmarks(bookmarkTreeNodes, null);
    },
    bookmarkRepo: bookmarkRepo,
    tagGroupRepo: tagGroupRepo
};
