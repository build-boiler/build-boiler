import {Reactor} from 'nuclear-js';
import {store} from './modules';

const reactor = new Reactor({
  debug: process.env.NODE_ENV === 'development'
});

reactor.registerStores(store);

export default reactor;
