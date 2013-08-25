/**!
 * AngularJS file upload directive and http post
 * @author  Danial  <danial.farid@gmail.com>
 * version 0.1.1
 */
var angularFileUpload = angular.module('angularFileUpload', []);

angularFileUpload.directive('ngFileSelect', [ '$parse', '$http', function($parse, $http) {
    if ($http.uploadFile === undefined) {
        $http.uploadFile = function(config) {
            return $http({
                method: 'POST',
                url: config.url,
                headers: { 'Content-Type': false },
                transformRequest: function (data) {
                    var formData = new FormData();
                    formData.append('file', config.file);
                    for (key in config.data) {
                        formData.append(key, config.data[key]);
                    }
                    return formData;
                }
            });
        };
    }

    return function(scope, elem, attr) {
        if (typeof FormData === 'undefined') {
            elem.wrap('<div class="js-fileapi-wrapper" style="position:relative; overflow:hidden">');
        }
        var fn = $parse(attr['ngFileSelect']);
		elem.bind('change', function(evt) {
		    var files = [];
            if (typeof FormData !== 'undefined') {
                var fileList = evt.target.files;
                for (var i = 0; i < fileList.length; i++) {
                    files.push(fileList.item(i));
                }
            } else {
                files = FileAPI.getFiles(evt);
            }
            scope.$apply(function() {
                fn(scope, {
                    $files: files,
                    $event : evt
                });
            });
		});
    };
} ]);