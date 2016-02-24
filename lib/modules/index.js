import makeActions from './actions';
import _store, {storeName} from './store';
import * as Getters from './getters';

export const store = {
  [storeName]: _store
};

export default function(reactor, opts = {}) {
  const Actions = makeActions(reactor, opts);

  return {
    Actions,
    Getters
  };
}
