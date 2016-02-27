<div>
  <input type="text" value={defaultValue} />
  <button onclick="alert('clicked!');">Click Me!</button>
  <ul>
    {['un', 'deux', 'trois'].map(function(number) {
      return <li>{number}</li>;
    })}
  </ul>
</div>;
