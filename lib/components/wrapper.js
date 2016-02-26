import _ from 'lodash';
import React, {Children, Component, PropTypes, cloneElement} from 'react';
import {provideReactor} from 'nuclear-js-react-addons';

@provideReactor({
  Actions: PropTypes.object,
  Getters: PropTypes.object,
  id: PropTypes.string
})
export default class FormWrapper extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.array
    ])
  };

  constructor(props) {
    super(props);
    const {children} = props;
    let clones;

    if (_.isArray(children)) {
      clones = React.Children.map(children, (child, i) => {
        return cloneElement(child, {key: `child_${i}`});
      });
    } else {
      clones = children;
    }

    this.children = clones;
  }

  render() {
    const children = this.children;

    return _.isArray(children) ? <div>{children}</div> : Children.only(children);
  }
}
