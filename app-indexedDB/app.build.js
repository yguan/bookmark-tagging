({
   //node tools/r.js -o app-indexedDB/app.build.js
    appDir: '.',
    baseUrl: 'js',
    dir: '../app-built',
    name: 'app',

    //Exclude jquery from the built lib,
    //since it is used in the index.html
    //directly too, and demonstrates
    //async loading.
//    exclude: ['jquery'],

    //Comment this line out to get
    //minified content.
//    optimize: 'none',

    //Uncomment this line if you want the
    //built file to use eval with sourceURL
    //for each module built into the built file.
    //This can help make debugging of the built file
    //a little more pleasant in the debugger.
    //Note however that it only seems to work well
    //in Chrome at the moment. Firefox may be confused
    //by the double eval going on.
    //Also, only use it when not doing minification,
    //just for debugging only. It also may cause
    //problems if you are using IE conditional comments
    //in JavaScript
    //useSourceUrl: true,

    //Instruct the r.js optimizer to
    //convert commonjs-looking code
    //to AMD style, which is needed for
    //the optimizer to properly trace
    //dependencies.
    cjsTranslate: true
})