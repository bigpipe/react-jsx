# react-jsx

[![From bigpipe.io][from]](http://bigpipe.io)[![Version npm][version]](http://browsenpm.org/package/react-jsx)[![Build Status][build]](https://travis-ci.org/bigpipe/react-jsx)[![Dependencies][david]](https://david-dm.org/bigpipe/react-jsx)[![Coverage Status][cover]](https://coveralls.io/r/bigpipe/react-jsx?branch=master)

[from]: https://img.shields.io/badge/from-bigpipe.io-9d8dff.svg?style=flat-square
[version]: http://img.shields.io/npm/v/react-jsx.svg?style=flat-square
[build]: http://img.shields.io/travis/bigpipe/react-jsx/master.svg?style=flat-square
[david]: https://img.shields.io/david/bigpipe/react-jsx.svg?style=flat-square
[cover]: http://img.shields.io/coveralls/bigpipe/react-jsx/master.svg?style=flat-square

React-jsx allows you to compile your `.jsx` templates files to React's DOM API
for client-side scripts and to pure HTML strings on the server. All with exactly
the same syntax. In addition to that, the generated templates no longer require
global variables in order to work but can be controlled with a dedicated `data`
argument.

By using the same templates on the front and back-end you can create
progressively enhanced and SEO friendly web pages.

## Installation

The module is published in the public npm registry and can be installed using:

```
npm install --save react-jsx
```

## Usage

Lets get started with requiring our `jsx` compiler, this is the same setup we
will use in all our example codes:

```js
'use strict';

var jsx = require('react-jsx');
```

The `jsx` object will now contain **2** methods:

- **server** Use this method if you want to generate templates that can be run
  on your server. It will return a `function` which can be called with a `data`
  object and will return a `string` which is the HTML representation.
- **client** Use this method if you want embed your JSX template in client-side
  asset files. It returns a `function` which can be called with a `data` object
  and will return a `React.createElement` representation. If you want to use
  this on the client side you might want to transform it to a string first, but
  more on that later.

Both methods expose the same API and options:

```js
jsx.server('your template string', { /* options */});
jsx.client(fs.readFileSync('template.jsx', 'utf-8'), {});
```

The following options are supported:

- **filename**: The filename of the provided template string, can be used for
  debugging purposes.
- **debug**: When set to `true` we will automatically inline source map.
- **ecma**: Which ECMA version should the template be compiled towards. It
  defaults to `es3` for the client and `es5` on the server.
- **types** Don't use strict types.
- **raw** This is a server side only options which allows you to switch to a
  pure non-react polluted static markup. Normally there's a bunch of
  `data-react-x` attributes added to the elements, setting this option to `true`
  will remove those.

```js
var template = fs.readFileSync('/path/to/template.jsx', 'utf-8')
  , render = jsx.server(template, { filename: 'template.jsx' });

console.log(render({ foo: 'bar' }));
```

Example `template.jsx`:

```jsx
/** @jsx React.DOM */

<div>
  <input type="text" value={foo} />
</div>;
```

As you can see in the example above you should not `module.exports` or `return`
your `jsx` template but just define it as regular HTML. This module takes care
of the export handling.

### Client

As mentioned previously, when you use the `jsx.client()` method it will return a
`function` which returns `React.createElement` nodes. It assumes that `React` is
available as global in your environment. To export this client compatible
template you might want to transform it to a string and include it your build
files. The string transformation is quite easy to do:

```js
var build = 'var mytemplate = '+ jsx.client(template).toString();
```

The `.toString()` method automatically transforms the function in to an
anonymous function. In the example above we saved the template as `mytemplate`
variable. So when we store this a JavaScript file to disk using a
`fs.writeFileSync('/mytemplate.js', mytemplate);` we can easily access the
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
/** @jsx React.DOM */

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

When we compile this template for server-side usage with the **raw** option
enabled:

```js
var server = jsx.server(template, { raw: true });
console.log(server);
```

It will generate the following output:

```html
<div><input type="text" value="10"><button>Click Me!</button><ul><li>un</li><li>deux</li><li>trois</li></ul></div>
```

And with the **raw** option set to **false** it will generate:

```html
<div data-reactid=".26uh899yvb4" data-react-checksum="-314283895"><input type="text" value="10" data-reactid=".26uh899yvb4.0"><button data-reactid=".26uh899yvb4.1">Click Me!</button><ul data-reactid=".26uh899yvb4.2"><li data-reactid=".26uh899yvb4.2.0">un</li><li data-reactid=".26uh899yvb4.2.1">deux</li><li data-reactid=".26uh899yvb4.2.2">trois</li></ul></div>
```

And last but not least, the client:

```js
var client = jsx.client(template);
console.log(client.toString());
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

## Versioning

The minor version of this module is in sync with the version of `react` and
`react-tools` that we depend upon. Bug fixes to this library will be done as
patch releases so you should read our versioning as:

```
<react.major.version>.<react.minor.version>.<our.react-jsx-module.patches>
```

The earliest version of react that we support is **0.12**.

## License

MIT
