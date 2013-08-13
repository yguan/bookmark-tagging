var _bookmarkDB = TAFFY(),
    _tagGroupDB = TAFFY();

function createTagGroup(id, tags) {
    _tagGroupDB.insert({id: id, tags: tags});
    return _tagGroupDB({id: id}).first();
}

//traverseBookmarks(bookmarks[0].children[0].children, null)

function traverseBookmarks(bookmarkTreeNodes, tagGroup) {
    var node,
        i,
        len,
        tags,
        newTagGroup,
        newTags;

    for(i=0, len = bookmarkTreeNodes.length; i < len; i++) {
        node = bookmarkTreeNodes[i];

        if (node.url) {
            _bookmarkDB.insert({tagGroupId: tagGroup && tagGroup.id, title: node.title, url: node.url});
        } else {
            tags = (tagGroup && tagGroup.tags) || [];
            newTags = _.clone(tags);
            newTags.push(node.title);
            newTagGroup = createTagGroup(node.id, newTags);

            if(node.children) {
                traverseBookmarks(node.children, newTagGroup);
            }
        }
    }
}

function findTagGroups(tags) {
    var groups = [];
    _tagGroupDB().each(function (record,recordnumber) {
        if (_.intersection(tags, record['tags']).length === tags.length) {
            groups.push(record.id);
        }
    });
    return groups;
}

//findTagGroups(['Invest', 'China'])

function updateTags(tagsToChange, newTags) {
    
}

