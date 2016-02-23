import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import sample from './component-utils/sample';

if (process.env.NODE_ENV === 'development') {
  /*eslint-disable */
  console.log('SAMPLE MOD', sample);
  console.log('MAIN JS LOADED');
  /*eslint-enable */
}

const Hello = ({userName}) => <h1>Helloooooo {userName}!!!</h1>;

Hello.propTypes = {
  userName: PropTypes.string
};

ReactDOM.render(
  <Hello userName={global.userName} />,
  document.querySelector('[data-react]')
);


