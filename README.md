# react-jsx

[![From bigpipe.io][from]](http://bigpipe.io)[![Version npm][version]](http://browsenpm.org/package/react-jsx)[![Build Status][build]](https://travis-ci.org/bigpipe/react-jsx)[![Dependencies][david]](https://david-dm.org/bigpipe/react-jsx)[![Coverage Status][cover]](https://coveralls.io/r/bigpipe/react-jsx?branch=master)

[from]: https://img.shields.io/badge/from-bigpipe.io-9d8dff.svg?style=flat-square
[version]: http://img.shields.io/npm/v/react-jsx.svg?style=flat-square
[build]: http://img.shields.io/travis/bigpipe/react-jsx/master.svg?style=flat-square
[david]: https://img.shields.io/david/bigpipe/react-jsx.svg?style=flat-square
[cover]: http://img.shields.io/coveralls/bigpipe/react-jsx/master.svg?style=flat-square

The `react-jsx` module allows you to compile your JSX (`.jsx`) templates to:

- React's `React.createElement` DOM syntax (default for server and client).
- React's HTML output.
- Pure HTML output.

These templates can be used on the server **and** client. This way you can move
your `JSX` templates out of your `React.createClass`'s `render` method and to
it's own template files which leads to a more manageable code base.

In addition to the features mentioned above we also eliminated the requirement
of "global" and "locally" scoped variables in your template. You can now pass in
the data using a `data` argument.

By using the same templates on the front and back-end you can create
progressively enhanced and SEO friendly web pages.

## Table of Contents

- [Installation](#installation)
- [Versioning](#versioning)
- [Usage](#usage)
- [Passing data around](#passing-data-around)
- [Templates](#templates)
- [Client-side](#client-side)
- [Output](#output)
- [Warnings](#warnings)
- [License](#license)

## Installation

The module is published in the public npm registry and can be installed using:

```
npm install --save react-jsx
```

And that's it! To learn more about how the API works, continue to the [usage]
section.

## Versioning

The minor version of this module is in sync with the version of `react` and
`react-tools` that we depend upon. Bug fixes to this library will be done as
patch releases so you should read our versioning as:

```
<react.major.version>.<react.minor.version>.<our.react-jsx-module.patches>
```

The earliest version of react that we support is **0.12**. So please note that
our 0.0.x releases CAN include a breaking change so when you're adding this
module to your package.json make sure you put down the full semver version.

## Usage

In all of the examples we assume that you've already required the `jsx` compiler
as following:

```js
'use strict';

var jsx = require('react-jsx');
```

This `jsx` variable now contains 3 methods:

- **server** Use this method if you want transform your `jsx` templates for
  server-side usage. We will automatically inject `React` as global in the
  templates so it all works as intended. We will return a function which you can
  call to render your template.
- **client** Use this method if you want to transform your `jsx` templates for
  client-side usage. It assumes that React is already available as global on the
  page. We will return a function which you can call to render you template.
- **transform** Our internal compiler which transforms the JSX templates to a
  template API.

Both the **server** and **client** method share the same API for compiling and
rendering:

```js
var template = fs.readFileSync('template.jsx', 'utf-8');

var server = jsx.server(template, { /* options */});
var client = jsx.client(template, {});

console.log(server({ data: 'for template' }));
```

And they also share the same options:

- **filename**: File name of the template file we're about to process. This will
  be used for debugging purposes in the inlined source map when you've set
  `debug` to true.
- **debug**: When set to `true`, we will automatically inline source map.
- **ecma**: Which ECMA version should the template be compiled towards. It
  defaults to `es3` for the client and `es5` on the server.
- **types** Don't use strict types.
- **raw** This allows you to control how the generated HTML is outputted. By
  default we output the React generated HTML which is full of `data-react-xxx`
  attributes. Setting this option to `true` will return a clean HTML instead.

When rendering the templates both the server and client method will return the
expected `React.createElement` nodes just like you would normally do in your
templates so you can easily share templates with child/parent relations. If you
want the template methods. But your might want to output the raw/pure HTML
instead. This can be done by supplying `{ html: true }` as option to the
template function:

```js
var template = fs.readFileSync('/path/to/template.jsx', 'utf-8')
  , render = jsx.server(template, { filename: 'template.jsx' });

console.log(render({ foo: 'bar' }, { html: true }));
```

### Passing data around

The generated client and server functions accept data or "scope" for the
templates as first argument:

```js
render({ foo: 'bar' });
```

If you want to set a custom `this` context for the template you could call the
returned template function as followed:

```js
render.call({ custom: 'this', value: 'is possible' });
```

But the template function we've generated is smart enough to figure out if
you're passing around React instances and will automatically set the supplied
`data` argument as context:

```js
var HelloWorld = React.createClass({
  render: function render() {
    return render(this);
  }
});
```

So in the example above the data argument is set to `this` so it will
automatically be introduced as `this` in the template AND all properties and
methods will also be introduced as local variables. So if where to mixins the
`React.Intl` module in the class above your template would have access to
`<FormattedMessage>` components:

```js
var HelloWorld = React.createClass({
  mixins: [require('react-intl').IntlMixin]
  render: function render() {
    return render(this);
  }
});
```

And the template that you would render could then contain:

```jsx
<FormattedMessage
  message={this.getIntlMessage('post.meta')}
  num={this.props.post.comments.length}
  ago={<FormattedRelative value={thisprops.post.date} />}
/>
```

### Templates

The `.jsx` templates that you're creating should only contain the parts that are
transformed in to `React.createElement`'s. In addition to that there is no need
to `return` or `module.exports` the template. This is all taken care of under
the hood. The following example would a valid example of this:

```jsx
<div>
  <input type="text" value={foo} />
</div>;
```

Working with components isn't a problem either, you can still pass them around
using the `data` argument of the template function as illustrated in this HTTP
server example: 

```js
var http = require('http')
  , path = require('path')
  , React = require('react')
  , jsx = require('react-jsx')
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
```

```jsx
/* index.jsx */
<html>
  <head>
    <title>{title}</title>
  </head>
  <body>
    <HelloWorld name={another} />
  </body>
</html>
```

```jsx
/* hello.jsx */
<div>
  Hello world, you're just another {this.props.name}
</div>
```

### Client-side

The client that we generate is a function but is optimized for ES3 so it works
in older browser versions without any addition hassle. As the `jsx.client()`
method returns a function you might need to transform this to a string if you
want to use it for client side templates. The string transformation is quite
easy to do:

```js
var build = 'var mytemplate = '+ jsx.client(template).toString();
```

The `.toString()` method automatically transforms the function in to an
anonymous function. In the example above we saved the template as `mytemplate`
variable. So when we store this a JavaScript file to disk using a
`fs.writeFileSync('/mytemplate.js', build);` we can easily access the
template on the client side by referencing the `mytemplate` global.

So with this knowledge, an illustration of this:

```js
var Component = React.createClass({
  render: function render() {
    return mytemplate({ foo: 'bar' });
  }
});
```

### Output

To give you an idea about what we're actually generating here, lets take the
following JSX template and convert it a client and server template:

```jsx
<div>
  <input type="text" value={defaultValue} />
  <button onclick="alert('clicked!');">Click Me!</button>
  <ul>
    {['un', 'deux', 'trois'].map(function(number) {
      return <li>{number}</li>;
    })}
  </ul>
</div>;
```

When we compile this template for server-side usage with the **raw** and
**html** options enabled:

```js
var server = jsx.server(template, { raw: true });
console.log(server({ defaultValue: 10 }, { html: true }));
```

It will generate the following output:

```html
<div><input type="text" value="10"><button>Click Me!</button><ul><li>un</li><li>deux</li><li>trois</li></ul></div>
```

And with the **raw** option set to **false** it will generate:

```html
<div data-reactid=".26uh899yvb4" data-react-checksum="-314283895"><input type="text" value="10" data-reactid=".26uh899yvb4.0"><button data-reactid=".26uh899yvb4.1">Click Me!</button><ul data-reactid=".26uh899yvb4.2"><li data-reactid=".26uh899yvb4.2.0">un</li><li data-reactid=".26uh899yvb4.2.1">deux</li><li data-reactid=".26uh899yvb4.2.2">trois</li></ul></div>
```

But by default we will just return React.createElement structures:

```js
var client = jsx.client(template);
console.log(client({ defaultValue: 10 }));
```

Returns the expected `React.createElement` structure:

```js
React.createElement("div", null,
  React.createElement("input", {type: "text", value: defaultValue}),
  React.createElement("button", {onclick: "alert('clicked!');"}, "Click Me!"),
  React.createElement("ul", null,
    ['un', 'deux', 'trois'].map(function(number) {
      return React.createElement("li", null, number);
    })
  )
);
```

## Warnings

As we are using the `react-tools` to compile the templates to all the nice
things it can happen that it output's "useful" information about your templates
in the terminal. For example for the template used above you would see the
following warning in your terminal:

```
Warning: You provided a `value` prop to a form field without an `onChange`
handler. This will render a read-only field. If the field should be mutable use
`defaultValue`. Otherwise, set either `onChange` or `readOnly`.
```

There's not really a way to prevent this from happening except for running your
code with `NODE_ENV=production` as this will silence the warnings.

## License

MIT
