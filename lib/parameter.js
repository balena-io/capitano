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
const validate = require('./validate');
const words = require('./words');

/**
 * @summary Parameter class
 * @public
 * @class
 */
class Parameter {

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
    if (!validate.isOptionsObjectValid(options)) {
      throw new Error(`Invalid parameter: ${options}`);
    }

    _.defaults(options, {
      optional: false,
      variadic: false
    });

    if (!validate.isNameValid(options.name)) {
      throw new Error(`Invalid parameter name: ${options.name}`);
    }

    if (!validate.isTypeValid(options.type) || _.includes(options.type, types.supported.BOOLEAN)) {
      throw new Error(`Invalid parameter type: ${options.type}`);
    }

    if (!validate.isDescriptionValid(options.description)) {
      throw new Error(`Invalid parameter description: ${options.description}`);
    }

    if (!validate.isFlagValid(options.optional)) {
      throw new Error(`Invalid parameter optional flag: ${options.optional}`);
    }

    if (!validate.isFlagValid(options.variadic)) {
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
   * console.log(parameter.toString());
   * > '<foo>'
   */
  toString() {
    const CONTENT = this.variadic ? `${this.name}...` : this.name;
    return this.optional ? `[${CONTENT}]` : `<${CONTENT}>`;
  }

}

/**
 * @summary Check if a set of arguments match this parameter
 * @function
 * @public
 *
 * @param {Object} parameter - parameter
 * @param {String[]} argv - arguments
 * @returns {Boolean} whether the arguments match this parameter
 *
 * @example
 * const parameter = new Parameter({
 *   name: 'foo',
 *   type: [ 'string' ],
 *   description: 'foo parameter'
 * });
 *
 * if (Parameter.matches(parameter, [ 'bar' ])) {
 *   console.log('The words match the parameter');
 * }
 */
Parameter.matches = (parameter, argv) => {
  return words.matches(argv, {
    type: parameter.type,
    optional: Parameter.isOptional(parameter),
    variadic: Parameter.isVariadic(parameter)
  });
};

/**
 * @summary Check if a parameter is optional
 * @function
 * @public
 *
 * @param {Object} parameter - parameter
 * @returns {Boolean} whether the parameter is optional
 *
 * @example
 * const parameter = new Parameter({
 *   name: 'foo',
 *   type: [ 'string' ],
 *   optional: true
 * });
 *
 * if (Parameter.isOptional(parameter)) {
 *   console.log('This parameter is optional');
 * }
 */
Parameter.isOptional = (parameter) => {
  return Boolean(parameter.optional);
};

/**
 * @summary Check if a parameter is required
 * @method
 * @public
 *
 * @param {Object} parameter - parameter
 * @returns {Boolean} whether the parameter is required
 *
 * @example
 * const parameter = new Parameter({
 *   name: 'foo',
 *   type: [ 'string' ],
 *   optional: false
 * });
 *
 * if (Parameter.isRequired(parameter)) {
 *   console.log('This parameter is required');
 * }
 */
Parameter.isRequired = (parameter) => {
  return !Parameter.isOptional(parameter);
};

/**
 * @summary Check if a parameter is variadic
 * @method
 * @public
 *
 * @param {Object} parameter - parameter
 * @returns {Boolean} whether the parameter is variadic
 *
 * @example
 * const parameter = new Parameter({
 *   name: 'foo',
 *   type: [ 'string' ],
 *   variadic: true
 * });
 *
 * if (Parameter.isVariadic(parameter)) {
 *   console.log('This parameter is variadic');
 * }
 */
Parameter.isVariadic = (parameter) => {
  return Boolean(parameter.variadic);
};

module.exports = Parameter;
