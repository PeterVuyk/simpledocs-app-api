// https://www.30secondsofcode.org/js/s/omit
const omit = (obj: any, arr: any) =>
  Object.keys(obj)
      .filter((k) => !arr.includes(k))
      // @ts-ignore
      // eslint-disable-next-line no-return-assign
      .reduce((acc, key) => ((acc[key] = obj[key]), acc), {});

export default omit;
