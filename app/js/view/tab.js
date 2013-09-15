define(function (require, exports, module) {

    exports.create = function(url, callback) {
        if (!chrome.tabs) {
            return;
        }
        chrome.tabs.create({
            active: true,
            url: url
        }, callback);

    };

    exports.openInNewTab = function (viewUrl, callback) {
        this.create(location.origin + location.pathname + '#' + viewUrl, callback);
    };
});

