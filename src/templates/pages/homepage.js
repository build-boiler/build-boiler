import React from 'react';
import ReactDOM from 'react-dom';
import Wrapper from 'components/wrapper';
import Sample from 'components/sample';
import AnotherSample from 'components/another-sample';
import bootstrap from 'bootstrap';
import data from 'data/mock_data';
import './local.css';
import './local.scss';

const {
  fluxStore,
  ...props
} = bootstrap(data);

const comp = (
  <Wrapper
    reactor={fluxStore}
    {...props}
  >
  <Sample />
  <AnotherSample />
  </Wrapper>
);

ReactDOM.render(
  comp,
  document.querySelector('[data-isomorphic]')
);
