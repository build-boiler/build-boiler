import React, {Component, PropTypes} from 'react';

export default class AnotherSample extends Component {
  static contextTypes = {
    Actions: PropTypes.object,
    Getters: PropTypes.object,
    id: PropTypes.string
  };

  render() {
    return <h1>Message from Second Sample</h1>;
  }
}

