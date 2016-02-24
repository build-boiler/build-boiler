import React from 'react';
import ReactDOM from 'react-dom';
import Sample from '../../lib/components/sample';
import bootstrap from '../../lib/bootstrap';
import data from './data/mock_data';

const {
  fluxStore,
  ...props
} = bootstrap(data);

ReactDOM.render(
  <Sample
    reactor={fluxStore}
    {...props}
  />,
  document.querySelector('[data-isomorphic]')
);


