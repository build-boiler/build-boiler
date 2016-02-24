import {storeName} from './store';

export const state = [storeName];

export const stateById = (id) => [...state, id];
