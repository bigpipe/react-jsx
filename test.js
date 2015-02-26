describe('react-jsx', function () {
  'use strict';

  var assume = require('assume')
    , React = require('react')
    , path = require('path')
    , jsx = require('./')
    , fs = require('fs')
    , fixtures
    , from;

  //
  // Read all the templates from the fixtures directly to make sure that we can
  // render all the things correctly.
  //
  from = path.join(__dirname, 'fixtures');
  fixtures = fs.readdirSync(from).reduce(function each(fixtures, file) {
    if (path.extname(file) !== '.jsx') return fixtures;

    fixtures[file.slice(0, -4)] = fs.readFileSync(path.join(from, file), 'UTF-8');

    return fixtures;
  }, {});

  var Hello = React.createClass({
    render: function render() {
      return React.createElement("div", null, "Hello ", this.props.name);
    }
  });

  describe('.client', function () {
    before(function () {
      global.React = require('react');
    });

    it('is exported as a function', function () {
      assume(jsx.client).is.a('function');
    });

    it('can compile the `react.jsx` template', function () {
      var client = jsx.client(fixtures.react);

      assume(client).is.a('function');
    });

    it('can render the `react.jsx` to a DOM node', function () {
      var client = jsx.client(fixtures.react);

      assume(client).is.a('function');
      assume(React.isValidElement(client())).is.true();
    });

    it('can introduce local variables', function () {
      var client = jsx.client(fixtures.advanced);

      assume(client).is.a('function');
      assume(React.isValidElement(client({ defaultValue: 1 }))).is.true();
    });
  });

  describe('.server', function () {
    before(function () {
      delete global.React;
    });

    it('is exported as a function', function () {
      assume(jsx.server).is.a('function');
    });

    it('can compile the `react.jsx` template', function () {
      var server = jsx.server(fixtures.react);

      assume(server).is.a('function');
    });

    it('can render the `react.jsx` to a raw template string', function () {
      var server = jsx.server(fixtures.react, { raw: true });

      assume(server).is.a('function');
      assume(server()).equals('<div>content</div>');
    });

    it('can render the `react.jsx` to a react template string', function () {
      var server = jsx.server(fixtures.react);

      assume(server).is.a('function');
      assume(server()).includes('data-reactid');
      assume(server()).includes('data-react-checksum');
      assume(server()).includes('content');
      assume(server()).includes('div');
    });

    it('can introduce local variables', function () {
      var server = jsx.server(fixtures.advanced);

      assume(server).is.a('function');
      assume(server({ defaultValue: 1 })).includes('button');
    });

    it('can render components', function () {
      var server = jsx.server(fixtures.component, { raw: true })
        , result = server({
            Hello: Hello,
            namethings: function name(named) {
              return named;
            }
        });

      assume(result).equals('<div>Hello john</div>');
    });
  });
});
