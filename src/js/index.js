import React from 'react';
import ReactDOM from 'react-dom';

if (process.env.NODE_ENV === 'development') {
  /*eslint-disable */
  console.log('MAIN JS LOADED');
  /*eslint-enable */
}

const Hello = ({userName}) => <h1>Helloooooo {userName}!!!</h1>;

ReactDOM.render(
  <Hello userName={global.userName} />,
  document.querySelector('[data-react]')
);


