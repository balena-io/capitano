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

module.exports = class Example {

  /**
   * @summary Create an instance of Example
   * @name Example
   * @class
   * @public
   *
   * @param {Object} options - options
   * @param {String[]} [options.parameters] - example command parameters
   * @param {String} [options.description] - example description
   * @param {Object} [options.options] - example options
   *
   * @example
   * const example = new Example({
   *   parameters: [ 'bar', 'baz' ],
   *   description: 'the foo command',
   *   options: {
   *     yes: true
   *   }
   * });
   */
  constructor(options) {
    if (_.isNil(options) || _.isEmpty(options) || !_.isPlainObject(options)) {
      throw new Error(`Invalid example: ${options}`);
    }

    if (!_.isNil(options.parameters) && _.some([
      !_.isArray(options.parameters),
      !_.isNil(_.find(options.parameters, _.overSome([
        _.isBoolean,
        _.isObject
      ])))
    ])) {
      throw new Error(`Invalid example parameters: ${options.parameters}`);
    }

    if (!_.isNil(options.description) && !_.isString(options.description)) {
      throw new Error(`Invalid example description: ${options.description}`);
    }

    if (!_.isNil(options.options)) {
      if (!_.isPlainObject(options.options)) {
        throw new Error(`Invalid example options: ${options.options}`);
      }

      const invalidValue = _.find(_.values(options.options), _.isObject);
      if (!_.isNil(invalidValue)) {
        throw new Error(`Invalid example option value: ${invalidValue}`);
      }
    }

    this.parameters = options.parameters;
    this.description = _.trim(options.description);
    this.options = options.options;
  }

};
