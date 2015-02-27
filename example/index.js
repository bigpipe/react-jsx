'use strict';

var jsx = require('../')
  , http = require('http')
  , path = require('path')
  , React = require('react')
  , read = require('fs').readFileSync;

var templates = {
  hello: jsx.server(read(path.join(__dirname, 'hello.jsx'), 'utf-8')),
  index: jsx.server(read(path.join(__dirname, 'index.jsx'), 'utf-8'))
};

var HelloWorld = React.createClass({
  render: function render() {
    return templates.hello(this);
  }
});

http.createServer(function (req, res) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');

  res.end(templates.index({
    HelloWorld: HelloWorld,
    title: 'Hello world',
    another: 'variable'
  }, { html: true }));
}).listen(8080);
