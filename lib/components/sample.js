import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';
import {nuclearComponent} from 'nuclear-js-react-addons';
import provideContext from '../decorators/provide-context';

@provideContext({
  Actions: PropTypes.object,
  Getters: PropTypes.object,
  id: PropTypes.string
})
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

  componentDidMount() {
    /*eslint-disable*/
    const node = $(ReactDOM.findDOMNode(this));
    console.log(node);
  }

  render() {
    const src = require('../../src/img/kitten.jpg');
    const {message} = this.props;

    return <div>
      <h1>Helloo There {message}</h1>
      <img src={src} />
    </div>
  }
}
