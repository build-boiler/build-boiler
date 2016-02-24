import fluxMod from './modules';
import reactor from './reactor';
import normalizeId from './normalize-id';

function _runBootstrap({env, data = {}}) {
  const {id} = data;
  let fluxData;

  if (env === 'server') {
    fluxData = fluxMod(reactor);
    const {Actions} = fluxData;
    const {id, ...rest} = data;

    Actions.FluxActions.register(id, rest);

  } else if (env === 'client') {
    const stateData = global.buildBoilerGlobals._fluxStore;

    reactor.loadState(stateData);
    fluxData = fluxMod(reactor);
  }

  return {
    id: normalizeId(id),
    fluxStore: reactor,
    ...fluxData
  };
}

export default function(data) {
  let props;

  const {_fluxStore} = global.buildBoilerGlobals || {};
  if (!_fluxStore) {
    props = _runBootstrap({env: 'server', data});
  } else {
    props = _runBootstrap({env: 'client', data});
    //add any additional registration here
  }

  return props;
}
