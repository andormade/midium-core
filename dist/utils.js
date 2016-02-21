'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.byteArrayToInt = byteArrayToInt;
exports.intToByteArray = intToByteArray;
/**
 * Converts byte array to 24 bit integer.
 *
 * @param {number|array} byteArray    Byte array
 *
 * @returns {void}
 */
function byteArrayToInt(byteArray) {
  if (typeof byteArray === 'number') {
    return byteArray;
  }

  return byteArray[0] * 0x10000 + byteArray[1] * 0x100 + byteArray[2];
};

/**
 * Converts 24 bit integer to byte array.
 *
 * @param {number|array} int    24 bit integer
 *
 * @returns {void}
 */
function intToByteArray(int) {
  if (typeof int === 'array') {
    return int;
  }

  return [int >> 16, int >> 8 & 0x00ff, int & 0x0000ff];
};