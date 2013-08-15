/**
 * @license cajon 0.1.10 Copyright (c) 2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/cajon for details
 */

/*jslint sloppy: true, regexp: true */
/*global location, XMLHttpRequest, ActiveXObject, process, require, Packages,
java, requirejs, document */
(function (requirejs) {
    var commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
        defineRegExp = /(^|[^\.])define\s*\(/,
        requireRegExp = /(^|[^\.])require\s*\(\s*['"][^'"]+['"]\s*\)/,
        exportsRegExp = /exports\s*=\s*/,
        exportsPropRegExp = /exports\.\S+\s*=\s*/,
        sourceUrlRegExp = /\/\/@\s+sourceURL=/,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        oldLoad = requirejs.load,
        hasOwn = Object.prototype.hasOwnProperty,
        docBase = document.location.href,
        docOrigin = location.protocol + '//' + location.host,
        fs;

    // Make sure docBase is a directory.
    if (docBase.lastIndexOf('/') !== docBase.length - 1) {
        docBase = docBase.split('/');
        docBase.pop();
        docBase = docBase.join('/') + '/';
    }

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    function exec(content) {
        /*jslint evil: true */
        return eval(content);
    }

    requirejs.cajonVersion = '0.1.10';
    requirejs.createXhr = function () {
        //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
        var xhr, i, progId;
        if (typeof XMLHttpRequest !== "undefined") {
            return new XMLHttpRequest();
        } else if (typeof ActiveXObject !== "undefined") {
            for (i = 0; i < 3; i += 1) {
                progId = progIds[i];
                try {
                    xhr = new ActiveXObject(progId);
                } catch (e) {}

                if (xhr) {
                    progIds = [progId];  // so faster next time
                    break;
                }
            }
        }

        return xhr;
    };

    requirejs.xdRegExp = /^((\w+)\:)?\/\/([^\/\\]+)/;

    /**
     * Is an URL on another domain. Only works for browser use, returns
     * false in non-browser environments. Only used to know if an
     * optimized .js version of a text resource should be loaded
     * instead.
     * @param {String} url
     * @returns Boolean
     */
    requirejs.useXhr = function (url, protocol, hostname, port) {
        var match = requirejs.xdRegExp.exec(url),
            uProtocol, uHostName, uPort;
        if (!match) {
            return true;
        }
        uProtocol = match[2];
        uHostName = match[3];

        uHostName = uHostName.split(':');
        uPort = uHostName[1];
        uHostName = uHostName[0];

        return (!uProtocol || uProtocol === protocol) &&
               (!uHostName || uHostName === hostname) &&
               ((!uPort && !uHostName) || uPort === port);
    };

    if (typeof process !== "undefined" &&
             process.versions &&
             !!process.versions.node) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');

        requirejs.cget = function (url, callback) {
            var file = fs.readFileSync(url, 'utf8');
            //Remove BOM (Byte Mark Order) from utf8 files if it is there.
            if (file.indexOf('\uFEFF') === 0) {
                file = file.substring(1);
            }
            callback(file);
        };
    } else if (requirejs.createXhr()) {
        requirejs.cget = function (url, callback, errback, onXhr) {
            var xhr = requirejs.createXhr();
            xhr.open('GET', url, true);

            //Allow overrides specified in config
            if (onXhr) {
                onXhr(xhr, url);
            }

            xhr.onreadystatechange = function (evt) {
                var status, err;
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    status = xhr.status;
                    if (status > 399 && status < 600) {
                        //An http 4xx or 5xx error. Signal an error.
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        errback(err);
                    } else {
                        callback(xhr.responseText);
                    }
                }
            };
            xhr.send(null);
        };
    } else if (typeof Packages !== 'undefined') {
        //Why Java, why is this so awkward?
        requirejs.cget = function (url, callback) {
            var encoding = "utf-8",
                file = new java.io.File(url),
                lineSeparator = java.lang.System.getProperty("line.separator"),
                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                stringBuffer, line,
                content = '';
            try {
                stringBuffer = new java.lang.StringBuffer();
                line = input.readLine();

                // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                // http://www.unicode.org/faq/utf_bom.html

                // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                if (line && line.length() && line.charAt(0) === 0xfeff) {
                    // Eat the BOM, since we've already found the encoding on this file,
                    // and we plan to concatenating this buffer with others; the BOM should
                    // only appear at the top of a file.
                    line = line.substring(1);
                }

                stringBuffer.append(line);

                while ((line = input.readLine()) !== null) {
                    stringBuffer.append(lineSeparator);
                    stringBuffer.append(line);
                }
                //Make sure we return a JavaScript string and not a Java string.
                content = String(stringBuffer.toString()); //String
            } finally {
                input.close();
            }
            callback(content);
        };
    }

    requirejs.load = function (context, moduleName, url) {
        var useXhr = (context.config && context.config.cajon &&
                     context.config.cajon.useXhr) || requirejs.useXhr,
            onXhr = (context.config && context.config.cajon &&
                     context.config.cajon.onXhr);

        if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
            requirejs.cget(url, function (content) {
                //Determine if a wrapper is needed. First strip out comments.
                //This is not bulletproof, but it is good enough for elminating
                //false positives from comments.
                var shimConfig, sourceUrl,
                    temp = content.replace(commentRegExp, '');

                if ((!context.config.shim || !hasProp(context.config.shim, moduleName)) &&
                    !defineRegExp.test(temp) && (requireRegExp.test(temp) ||
                    exportsRegExp.test(temp) || exportsPropRegExp.test(temp))) {
                    content = 'define(function(require, exports, module) {' +
                              'var __filename = module.uri || "", ' +
                              '__dirname = __filename.substring(0, __filename.lastIndexOf("/") + 1);\n' +
                              content +
                              '\n});\n';
                }

                // Some shimmed libaries declare themselves as "var something = {}",
                // and when that is is evaled, that var does not escape the evaled
                // scope, so insert a define that can access it.
                if (context.config.shim && hasProp(context.config.shim, moduleName)) {
                    shimConfig = context.config.shim[moduleName];
                    if (shimConfig && shimConfig.exports) {
                        content += "\ndefine('" + moduleName + "', function() { return " + shimConfig.exports + "; });\n";

                        // Make sure the script can been seen globally if it is
                        // just a local var reference. Using a detection of a
                        // dot in the exports value as shorthand for that.
                        if (shimConfig.exports.indexOf('.') == -1) {
                            content += '\nwindow.' + shimConfig.exports + ' = ' + shimConfig.exports + ';\n';
                        }
                    }
                }

                //Add sourceURL, but only if one is not already there.
                if (!sourceUrlRegExp.test(content)) {
                    sourceUrl = url;
                    if (sourceUrl.indexOf('/') === 0) {
                        sourceUrl = docOrigin + sourceUrl;
                    } else if (sourceUrl.indexOf(':') === -1) {
                        sourceUrl = docBase + sourceUrl;
                    }
                    //IE with conditional comments on cannot handle the
                    //sourceURL trick, so skip it if enabled.
                    /*@if (@_jscript) @else @*/
                    content += "\r\n//@ sourceURL=" + sourceUrl;
                    /*@end@*/
                }

                exec(content);
                context.completeLoad(moduleName);

            }, function (err) {
                throw err;
            }, onXhr);
        } else {
            return oldLoad.apply(requirejs, arguments);
        }
    };

}(requirejs));
