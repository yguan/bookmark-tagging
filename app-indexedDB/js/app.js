require.config({
    baseUrl: 'js',
    paths: {
        lib: './lib',
        data: './data'
    }
});

require(['lib/lodash.underscore', 'data/bookmark-loader', 'data/bookmarks-json'], function(l, loader, chromeBookmarks) {
    if (chrome.bookmarks) {
        // for chrome extension
        loader.loadBookmarksFromChrome();
    } else {
        // for regular web page
        require(['./data/bookmarks-json'], function(chromeBookmarks) {
            loader.loadChromeBookmarks(chromeBookmarks.bookmarks[0].children[0].children);
        });
    }

// python -m http.server
});

