'use strict';

var compiler = require('react-tools')
  , React = require('react');

/**
 * Watch out, here be demons. This is a hack to prevent JSX from assuming
 * globals everywhere. It's less harmful on the client as those are only used
 * for one client/user but when you are serving templates on the server to
 * hundreds of concurrent users you don't really want to start sharing global
 * variables. So what we do is force a `with` call in the template which
 * introduces all the keys of the supplied `data` argument as local variables.
 *
 * To make sure that we the generated React.createElement code we need to insert
 * a `return` statement in the function body. The safest way of doing this was
 * by searching for the first occurrence of React.createElement and insert
 * a `return` statement before it. This however limits the use to only "root"
 * element per template.
 *
 * @param {String} tpl Template contents.
 * @param {Object} config Configuration for the React JSX compiler.
 * @param {Object} options Template configuration.
 * @api private
 */
function transform(tpl, config, options) {
  var rdom = compiler.transform(tpl, config)
    , start = rdom.indexOf('React.createElement');

  return new Function('data', 'config', [
    'data = data || {};',

    'var nodes = (function jsx() {',
      rdom.slice(0, start),
      'with (data) return '+ rdom.slice(start),
    '}).call(this.props ? this : data),',
    'options = '+ JSON.stringify(options || {}) +';',

    'if ("DOM" === options.render || !(config || {}).html) return nodes;',
    'return React[options.render](nodes);'
  ].join('\n'));
}

/**
 * Compile the JSX template from client-side usage.
 *
 * @param {String} tpl JSX template string.
 * @param {Object} options Compilation configuration.
 * @returns {Function}
 * @api public
 */
function client(tpl, options) {
  options = options || {};

  /**
   * The template render method which returns React DOM elements.
   *
   * @param {Object} data Template variables that should be introduced.
   * @returns {React}
   * @api public
   */
  return transform(tpl, {
    sourceFilename: options.filename,
    target: options.ecma || 'es3',
    sourceMap: !!options.debug,
    stripTypes: !options.types
  }, {
    render: options.render || (options.raw ? 'renderToStaticMarkup' : 'renderToString')
  });
}

/**
 * Compile the JSX template from client-side usage.
 *
 * @param {String} tpl JSX template string.
 * @param {Object} options Compilation configuration.
 * @returns {Function}
 * @api public
 */
function server(tpl, options) {
  options = options || {};

  /**
   * The template render method which uses the compiled React-template to do all
   * the things.
   *
   * @param {Object} data Template variables that should be introduced.
   * @param {Object} config Override configuration.
   * @returns {String}
   * @api public
   */
  return (new Function('React', 'return '+ transform(tpl, {
    sourceFilename: options.filename,
    target: options.ecma || 'es5',
    sourceMap: !!options.debug,
    stripTypes: !options.types
  }, {
    render: options.render || (options.raw ? 'renderToStaticMarkup' : 'renderToString')
  })))(React);
}

//
// Expose all the various API's
//
exports.transform = transform;
exports.server = server;
exports.client = client;
