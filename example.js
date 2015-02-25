'use strict';

var path = require('path')
  , jsx = require('./')
  , fs = require('fs');

var template = fs.readFileSync(path.join(__dirname, 'fixtures', 'advanced.jsx'), 'utf-8')
  , raw = jsx.server(template, { raw: true })
  , server = jsx.server(template)
  , client = jsx.client(template)
  , data = { defaultValue: 10 };

console.log(raw(data));
console.log(server(data));
console.log(client.toString(data));
