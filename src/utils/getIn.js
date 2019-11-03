/**
 * 遍历object，方便深层查询参数
 * @param object
 * @param array
 * @returns {*}
 */
export default function getIn(object, array, defaultValue) {
  let temp;
  if (object && typeof array === 'object' && typeof object === 'object' && array.length > 0) {
    temp = object;
    for (let i = 0; i < array.length; i += 1) {
      if (temp !== null && temp && temp[array[i]] !== undefined) {
        temp = temp[array[i]];
      } else {
        temp = undefined;
        break;
      }
    }
  }
  return temp || defaultValue;
}
