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
const types = require('./types');

module.exports = class Parameter {

  /**
   * @summary Create an instance of Parameter
   * @name Parameter
   * @class
   * @public
   *
   * @param {Object} options - options
   * @param {String} options.name - parameter name
   * @param {String[]} options.type - parameter type
   * @param {String} [options.description] - parameter description
   * @param {Boolean} [options.optional=false] - is parameter optional
   * @param {Boolean} [options.variadic=false] - is parameter variadic
   *
   * @example
   * const parameter = new Parameter({
   *   name: 'foo',
   *   type: [ 'string' ],
   *   description: 'foo parameter',
   *   optional: true
   * });
   */
  constructor(options) {
    if (_.isNil(options) || _.isEmpty(options) || !_.isPlainObject(options)) {
      throw new Error(`Invalid parameter: ${options}`);
    }

    _.defaults(options, {
      optional: false,
      variadic: false
    });

    if (!_.isString(options.name)) {
      throw new Error(`Invalid parameter name: ${options.name}`);
    }

    if (_.some([
      !_.isArray(options.type),
      _.isEmpty(options.type),
      !_.isEmpty(_.reject(options.type, (type) => {
        return types.isSupported(type) && type !== types.supported.BOOLEAN;
      }))
    ])) {
      throw new Error(`Invalid parameter type: ${options.type}`);
    }

    if (!_.isNil(options.description) && !_.isString(options.description)) {
      throw new Error(`Invalid parameter description: ${options.description}`);
    }

    if (!_.isBoolean(options.optional)) {
      throw new Error(`Invalid parameter optional flag: ${options.optional}`);
    }

    if (!_.isBoolean(options.variadic)) {
      throw new Error(`Invalid parameter variadic flag: ${options.variadic}`);
    }

    this.name = options.name;
    this.type = options.type;
    this.description = options.description;
    this.optional = options.optional;
    this.variadic = options.variadic;
  }

  /**
   * @summary Convert Parameter to String
   * @method
   * @public
   * @returns {String} string representation
   *
   * @example
   * const parameter = new Parameter({
   *   name: 'foo',
   *   type: [ 'string' ],
   *   description: 'foo parameter'
   * });
   *
   * console.log(parameter);
   * > '<foo>'
   */
  toString() {
    const CONTENT = this.variadic ? `${this.name}...` : this.name;
    return this.optional ? `[${CONTENT}]` : `<${CONTENT}>`;
  }

  /**
   * @summary Check if a set of words match this parameter
   * @method
   * @public
   *
   * @param {String[]} words - words
   * @returns {Boolean} whether the words match this parameter
   *
   * @example
   * const parameter = new Parameter({
   *   name: 'foo',
   *   type: [ 'string' ],
   *   description: 'foo parameter'
   * });
   *
   * if (parameter.matches([ 'bar' ])) {
   *   console.log('The words match the parameter');
   * }
   */
  matches(words) {
    const VARIADIC_MINIMUM_WORD_SIZE = 2;

    if (_.some([
      !this.variadic && _.size(words) >= VARIADIC_MINIMUM_WORD_SIZE,
      !this.optional && _.isEmpty(words)
    ])) {
      return false;
    }

    return _.every(words, (word) => {
      return _.some(this.type, (type) => {
        return types.matches(type, word);
      });
    });
  }

};
