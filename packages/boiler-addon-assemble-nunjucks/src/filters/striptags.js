export default function(x) {
  return x ? x.replace(/(<([^>]+)>)/ig, '') : false;
}
