#!/usr/bin/env node

'use strict';

var browserify = require('browserify');
var b = browserify({debug: true});
var fs = require('fs');

b.add('./public/main.source.js');
b.bundle().pipe(fs.createWriteStream('./public/main.js'));