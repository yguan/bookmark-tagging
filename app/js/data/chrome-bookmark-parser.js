var bookmarks = [],
    tagGroups = [];

function parseChromeBookmarks(bookmarkTreeNodes, tags) {
    var node,
        i,
        len,
        tags,
        newTags;

    for(i=0, len = bookmarkTreeNodes.length; i < len; i++) {
        node = bookmarkTreeNodes[i];

        if (node.url) {
            bookmarks.push({
                tags: tags,
                title: node.title,
                url: node.url,
                dateAdded: new Date(node.dateAdded)
            });
        } else {
            newTags = _.clone(tags) || [];
            newTags.push(node.title);
            tagGroups.push(newTags);

            if(node.children) {
                parseChromeBookmarks(node.children, newTags);
            }
        }
    }
}

module.exports = {
    parseChromeBookmarks: function (bookmarkTreeNodes) {
        parseChromeBookmarks(bookmarkTreeNodes, null);
        return {
            bookmarks: bookmarks,
            tagGroups: tagGroups
        }
    }
};

/* function to traverse bookmark tree recursively
chrome.bookmarks.getTree(function (tree) {
    console.log(JSON.stringify(tree));
});
 */