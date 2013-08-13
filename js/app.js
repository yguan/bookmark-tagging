var _bookmarkDB = TAFFY(),
    _tagGroupDB = TAFFY();

function createTagGroup(id, tags) {
    _tagGroupDB.insert({id: id, tags: tags});
    return _tagGroupDB({id: id}).first();
}

//function createTag(title) {
//    if ()
//    return _tagDB.insert({title: title});
//}

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
/*
function traverseBookmarks(bookmarkTreeNodes, tagGroupKey) {
    var node,
        i,
        len,
        tagGroup = _tagGroups[tagGroupKey],
        tagGroupId = tagGroup ? tagGroup.id : null,
        tags = tagGroup ? tagGroup.tags : [],
        newTagGroupKey,
        newTagGroup;

    for(i=0, len = bookmarkTreeNodes.length; i < len; i++) {
        node = bookmarkTreeNodes[i];

        if (node.url) {
            _bookmarkDB.insert({id: node.id, tagGroupId: tagGroupId, title: node.title, url: node.url});
        } else {
            createTag(node.title);
        }

        if(node.children) {
            newTagGroupKey = tagGroupKey + '-' + node.id;
            if (!_tagGroups[newTagGroupKey]) {
                newTagGroup = createTagGroup(_.clone(tags));
                _tagGroups[newTagGroupKey] = newTagGroup;
            }
            traverseBookmarks(node.children, newTagGroupKey);
        }
    }
}
*/
//traverseBookmarks(bookmarks[0].children[0].children, '')
/*
function traverseBookmarks(bookmarkTreeNodes) {
    for(var i=0;i<bookmarkTreeNodes.length;i++) {
        console.log(bookmarkTreeNodes[i].title, bookmarkTreeNodes[i].url ? bookmarkTreeNodes[i].url : "[Folder]");

        if(bookmarkTreeNodes[i].children) {
            traverseBookmarks(bookmarkTreeNodes[i].children);
        } 

    }
}
idea -> business -> startup
*/