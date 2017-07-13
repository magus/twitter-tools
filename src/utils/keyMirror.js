// @flow
export function keyMirror(obj: any) {
  if (!(obj instanceof Object && !Array.isArray(obj))) {
    throw new Error('keyMirror(...): Argument must be an object.');
  }

  const mirror = {};

  Object.keys(obj).forEach(key => {
    mirror[key] = key;
  });

  return mirror;
}

export default keyMirror;
