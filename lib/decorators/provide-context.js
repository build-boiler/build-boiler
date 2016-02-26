import React, {Component} from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

function createComponent(ChildComponent, dataBindings) {
  const displayName = `ProvideContextComponent(${Component.displayName || Component.name})`;

  class ProvideContextComponent extends Component {
    static displayName = displayName;

    static contextTypes = dataBindings;

    render() {
      /**
       * Important to override context values with props because `formId` can be passed on the
       * `<Form />` as props or as context
       */
      return React.createElement(ChildComponent, {
        ...this.state,
        ...this.context,
        ...this.props
      });
    }
  }

  hoistNonReactStatics(ProvideContextComponent, Component);

  return ProvideContextComponent;
}

/*
 * Decorator using `React.Component`
*/
export default function provideContextDec(Component, dataBindings) {
  if (arguments.length === 0 || typeof arguments[0] !== 'function') {
    dataBindings = arguments[0];
    return function connectToData(ComponentToDecorate) {
      return createComponent(ComponentToDecorate, dataBindings);
    };
  }

  return createComponent.apply(null, arguments);
}
