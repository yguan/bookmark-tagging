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
    'lib/bootstrap/bootstrap',
    'lib/angular/angular',
    'lib/angular/ui-bootstrap-tpls',
    'lib/angular/bootstrap-tagsinput',
    'lib/angular/bootstrap-tagsinput-angular',
    'lib/angular/ng-grid',
    'lib/angular/angular-file-upload'
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
