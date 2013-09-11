_.mixin({
    toLowerCase : function(collection) {
        return _.map(collection, function(str){ return str.toLowerCase(); });
    },
    in: function (searchArray, targetArray) {
        return (_.intersection(searchArray, targetArray).length === searchArray.length);
    },
    mapToLookup: function (array, key) {
        var lookup = {};
        _.each(array, function (item) {
            lookup[item[key]] = item;
        });
        return lookup;
    }
});