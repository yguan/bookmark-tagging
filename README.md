# Bookmarks Tagging

This repository contains the source code of a Chrome extension which allows you to manage your bookmarks with tags instead of folders. You can package it as a Chrome extension or run it standalone as a website. You can also [download the extension](https://chrome.google.com/webstore/detail/bookmarks-tagging/kmdepbjjhlbhohppiancfgdpkjcoajgb?hl=en) from the Chrome Web Store.

Demo
-
It's hosted [here](http://yguan.github.io/repos/bookmark-tagging). However, the Web version has some missing functionality due to the security permission in Chrome.

User Manual

The user manual on how to use the bookmark extension is [here](User-Manual.md).

Development
-
Here is a list of files that are the foundation of the app:

- `index.html` - page that hosts the app 
- `ui.css` - CSS Style Override 
- `app.js` - app entry point 
- `all-views.js` - angular.js view routing and controller registrations
- `idb.js` - wrapper of [db.js](http://aaronpowell.github.io/db.js/)
- `bookmark-loader.js` - parse Chrome bookmarks and persist bookmarks and tagGroups
- `chrome-bookmark-parser.js` - parse the Chrome bookmarks and return bookmarks and tagGroups

Here are a couple links on building Chrome extension:
- [Getting Started](http://developer.chrome.com/extensions/getstarted.html)
- [Overview](http://developer.chrome.com/extensions/overview.html)

Build
-
[require.js](http://requirejs.org/) is used to manage dependency, and r.js is used to build the package. You can modify `app.build.js` to package the way you want. Details can be find [here](http://requirejs.org/docs/optimization.html#wholeproject).

To build the package, you have to have node.js installed, then in command line console, run the followings steps:

- go to `bookmark-tagging` folder
- run `node tools/r.js -o app/app.build.js`

The output folder is `app-built`, you can change it in the `app.build.js`.

Run as a Website locally
-
If you have [python](http://www.python.org/download/) installed, run the following steps in the command line console:

- go to `app` folder
- run `python -m http.server` (you can specify port number at the end as well, default is 8000)
- go Chrome, and type in the `localhost:8000` to the address bar
- you should see the app running in the browser in a few second

Note: you may have to refresh your browser manually a lot during the development so that the app loads the JavaScript files correctly.

Load as an extension
-
Follow the [steps](http://developer.chrome.com/extensions/getstarted.html#unpacked) from the Developer Guide, and load the files from the `app` folder.

Publish to Chrome Web Store
-
Create a zip file from the `app` folder, and then follow steps 3 in [this guide](https://developers.google.com/chrome/web-store/docs/publish#step3).
License
-
[MIT](http://opensource.org/licenses/MIT)