'use strict';
document.querySelector('#cityPicker').addEventListener('submit', event => {
  event.preventDefault();
  const destinations = {fukuoka:'./fukuoka/',tokyo:'./tokyo.html',sapporo:'./sapporo.html'};
  const destination = destinations[document.querySelector('#city').value];
  if (destination) window.location.assign(destination);
});
