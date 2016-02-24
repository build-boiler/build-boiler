import React, {PropTypes, Component} from 'react';
import {nuclearComponent, provideReactor} from 'nuclear-js-react-addons';

@provideReactor
@nuclearComponent((props) => {
  const {Getters, id} = props;

  return {
    message: [...Getters.state, id, 'message']
  };
})
export default class Sample extends Component {
  static propTypes = {
    message: PropTypes.string
  };

  render() {
    const {message} = this.props;

    return <h1>Helloo There {message}</h1>;
  }
}
