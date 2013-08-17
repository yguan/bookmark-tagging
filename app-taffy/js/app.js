require.config({
    baseUrl: 'js'
});

require(['./lib/lodash.underscore', './bookmark-loader', './bookmarks-json'], function(l, loader, chromeBookmarks) {
    if (chrome.bookmarks) {
        // for chrome extension
        loader.loadBookmarksFromChrome();
    } else {
        // for regular web page
        require(['./bookmarks-json'], function(chromeBookmarks) {
            loader.loadChromeBookmarks(chromeBookmarks.bookmarks[0].children[0].children);
        });
    }

// python -m http.server
});

