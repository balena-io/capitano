/*
 * Copyright 2017 resin.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const _ = require('lodash');

/**
 * @summary Supported types
 * @namespace supported
 * @public
 */
exports.supported = {

  /**
   * @property {Object} STRING
   * @memberof supported
   *
   * @description
   * String type.
   */
  STRING: 'string',

  /**
   * @property {Object} NUMBER
   * @memberof supported
   *
   * @description
   * Number type.
   */
  NUMBER: 'number',

  /**
   * @property {Object} BOOLEAN
   * @memberof supported
   *
   * @description
   * Boolean type.
   */
  BOOLEAN: 'boolean'

};

/**
 * @summary Check if a type is supported
 * @function
 * @public
 *
 * @param {String} type - type
 * @returns {Boolean} whether the type is supported
 *
 * @example
 * if (types.isSupported(types.supported.STRING)) {
 *   console.log('This type is supported');
 * }
 */
exports.isSupported = _.partial(_.includes, _.values(exports.supported));

/**
 * @summary Check if a value matches a certain type
 * @function
 * @public
 *
 * @param {String} type - type
 * @param {Any} value - value
 * @returns {Boolean} whether the value matches the type
 *
 * @example
 * if (types.matches(types.supported.STRING, 'foo')) {
 *   console.log('The value matches the type');
 * }
 */
exports.matches = (type, value) => {
  return _.some([
    type === exports.supported.STRING && _.isString(value),
    type === exports.supported.NUMBER && _.isNumber(value),
    type === exports.supported.BOOLEAN && _.isBoolean(value)
  ]);
};
