require.config({
    baseUrl: 'js',
    paths: {
        lib: './lib',
        data: './data',
        view: './view'
    }
});

require([
    'lib/lodash.underscore',
    'data/bookmarks-json',
    'lib/jquery',
    '../bootstrap/js/bootstrap.min',
    '../angular/angular',
    '../angular/ui-bootstrap-tpls',
    '../angular/bootstrap-tagsinput',
    '../angular/bootstrap-tagsinput-angular'
], function() {
    require([
        'data/bookmark-loader',
        'view/all-views'
    ], function(loader, views) {
        loader.init();
        views.init();
    });

//    if (chrome.bookmarks) {
//        // for chrome extension
//        loader.loadBookmarksFromChrome();
//    } else {
//        // for regular web page
//        require(['data/bookmarks-json'], function(chromeBookmarks) {
//            loader.loadChromeBookmarks(chromeBookmarks.bookmarks[0].children[0].children);
//        });
//    }
});

/*
require(['lib/lodash.underscore', 'data/bookmark-loader', 'data/bookmarks-json'], function(l, loader, chromeBookmarks) {
    if (chrome.bookmarks) {
        // for chrome extension
        loader.loadBookmarksFromChrome();
    } else {
        // for regular web page
        require(['data/bookmarks-json'], function(chromeBookmarks) {
            loader.loadChromeBookmarks(chromeBookmarks.bookmarks[0].children[0].children);
        });
    }

// python -m http.server
});
*/
