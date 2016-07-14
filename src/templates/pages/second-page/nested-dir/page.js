import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {provideReactor} from 'nuclear-js-react-addons';
import Sample from 'components/sample';
import bootstrap from 'bootstrap';
import data from 'data/mock_data';

const {
  fluxStore,
  ...props
} = bootstrap(data);

const Comp = provideReactor(Sample, {
  Actions: PropTypes.object,
  Getters: PropTypes.object,
  id: PropTypes.string
});

const comp = (
  <Comp
    reactor={fluxStore}
    {...props}
  />
);

ReactDOM.render(
  comp,
  document.querySelector('[data-isomorphic]')
);
