import child from './rewire-dep';

export default {
  callStuff() {
    return child.stuff();
  },
  callThings() {
    return child.things();
  }
};
