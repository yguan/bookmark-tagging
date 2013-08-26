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
    'lib/angular/ng-grid'
], function() {
    require([
        'data/bookmark-loader',
        'view/all-views'
    ], function(loader, views) {
        loader.init();
        views.init();
    });
    require(['lib/cd'], function(fs) {
        fs.init({size: 1073741824}, {
            success: function () {
//                fs.cd().read('myText.txt', function(done,res) {
//                    console.log(res);
//                });
                fs.cd().write('myText.txt','My foobar is great.');
            },
            failure: function (error) {
                console.log(error);
            }
        })
    });
});

// python -m http.server
