import actionTypes from './action-types';
import {Store, Immutable} from 'nuclear-js';

export const storeName = 'fluxStore';

function register(state, {id, data}) {
  return state.set(id, Immutable.fromJS(data));
}

function update(state, {id, data}) {
  return state.mergeIn([id], data);
}

export default Store({
  getInitialState() {
    return Immutable.Map();
  },

  initialize() {
    const {REGISTER, UPDATE} = actionTypes;

    this.on(REGISTER, register);
    this.on(UPDATE, update);
  }
});
