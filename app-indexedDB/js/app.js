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
    '../angular/bootstrap-tagsinput-angular',
    '../angular/ng-grid'
], function() {
    require([
        'data/bookmark-loader',
        'view/all-views'
    ], function(loader, views) {
        loader.init();
        views.init();
    });
});

// python -m http.server
