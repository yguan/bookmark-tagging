#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    r = fs.readFileSync(path.join(__dirname, 'require.js'), 'utf8'),
    c = fs.readFileSync(path.join(__dirname, 'c.js'), 'utf8'),
    combined = '';

// A bit brittle, but looking for something after the initial requirejs.load
// definition, but before any data-main or config-based loading is done.
combined = r.replace(/function\s*getInteractiveScript\s*\(\s*\)\s*\{/, c + '\n$&') +
           '\nvar cajon = requirejs;';

fs.writeFileSync(path.join(__dirname, '..', 'cajon.js'), combined, 'utf8');


