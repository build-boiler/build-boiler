import actionTypes from './action-types';
import normalizeId from '../normalize-id';

export default function(reactor, opts = {}) {
  const {REGISTER, UPDATE} = actionTypes;

  const FluxActions = {
    register(id, data) {
      reactor.dispatch(REGISTER, {
        id: normalizeId(id),
        data
      });
    },
    update(id, data) {
      reactor.dispatch(UPDATE, {
        id: normalizeId(id),
        data
      });
    }
  };

  return {FluxActions};
}
