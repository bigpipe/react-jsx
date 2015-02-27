describe('react-jsx', function () {
  'use strict';

  //
  // Turn off the annoying jsx warnings by forcing production.
  //
  process.env.NODE_ENV = 'production';

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
      return jsx.server(fixtures.hello)(this);
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

    it('can also output HTML', function () {
      var client = jsx.client(fixtures.react, { raw: true });

      assume(client({}, { html: true })).equals('<div>content</div>');
    });
  });

  describe('.server', function () {
    before(function () {
      delete global.React;
    });

    it('is exported as a function', function () {
      assume(jsx.server).is.a('function');
    });

    it('returns React.createElement by default', function () {
      var server = jsx.server(fixtures.react);

      assume(React.isValidElement(server())).is.true();
    });

    it('can compile the `react.jsx` template', function () {
      var server = jsx.server(fixtures.react);

      assume(server).is.a('function');
    });

    it('can render the `react.jsx` to a raw template string', function () {
      var server = jsx.server(fixtures.react, { raw: true });

      assume(server).is.a('function');
      assume(server({}, { html: true })).equals('<div>content</div>');
    });

    it('can render the `react.jsx` to a react template string', function () {
      var server = jsx.server(fixtures.react);

      assume(server).is.a('function');
      assume(server({}, { html: true })).includes('data-reactid');
      assume(server({}, { html: true })).includes('data-react-checksum');
      assume(server({}, { html: true })).includes('content');
      assume(server({}, { html: true })).includes('div');
    });

    it('can introduce local variables', function () {
      var server = jsx.server(fixtures.advanced);

      assume(server).is.a('function');
      assume(server({ defaultValue: 1 }, { html: true })).includes('button');
    });

    it('can render components', function () {
      var server = jsx.server(fixtures.component, { raw: true })
        , result = server({
            Hello: Hello,
            namethings: function name(named) {
              return named;
            }
        }, { html: true });

      assume(result).equals('<div>Hello john</div>');
    });

    it('assumes data should be used as this if it has props', function () {
      var server = jsx.server('<Hello name="lol" />', { raw: true })
        , that = jsx.server(fixtures.this);

      var Hello = React.createClass({
        render: function () {
          return that(this);
        }
      });

      assume(server).is.a('function');
      assume(server({ Hello: Hello }, { html: true })).equals('<div>lol</div>');
    });

    it('works with a custom `this`', function () {
      var that = jsx.server(fixtures.this, { raw: true });

      assume(that.call({
        props: { name: 'john' }
      }, {}, { html: true })).equals('<div>john</div>');
    });
  });
});
