require.config({
    baseUrl: 'js'
});

require(['./lib/lodash.underscore', './bookmark-loader', './bookmarks-json'], function(l, loader, chromeBookmarks) {
    function run() {
        loader.loadChromeBookmarks(chromeBookmarks.bookmarks[0].children[0].children);
//        loader.loadBookmarksFromChrome();
    }

    run();
// python -m http.server
});
