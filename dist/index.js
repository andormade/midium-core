'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _midium = require('./midium');

var _midium2 = _interopRequireDefault(_midium);

var _utils = require('./utils');

var Utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.assign(_midium2.default, Utils);

global.Midium = _midium2.default;
exports.default = _midium2.default;
module.exports = exports['default'];