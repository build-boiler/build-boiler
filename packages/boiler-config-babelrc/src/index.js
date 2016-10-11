import path from 'path';

const base = path.resolve.bind(path, __dirname, '..');

export const node4 = base('node-4.json');
export const node6 = base('node-6.json');
