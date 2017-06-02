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
const validate = require('./validate');
const types = require('./types');
const MODES = require('./parser/modes');

/**
 * @summary Option class
 * @public
 * @class
 */
class Option {

  /**
   * @summary Create an instance of Option
   * @name Option
   * @class
   * @public
   *
   * @description
   * If `environment` is true, then a default environment variable is
   * assigned by the Capitano framework. If its false, then no environment
   * variable is supported for this option, and finally, you can pass a
   * string to set a custom environment variable name, which will be
   * prefixed by the CLI application name.
   *
   * @param {Object} options - options
   * @param {String} options.name - option name
   * @param {String} [options.description] - option description
   * @param {String} [options.placeholder] - option placeholder
   * @param {String[]} options.type - option type
   * @param {*} [options.default] - option default value
   * @param {String[]} [options.aliases] - option aliases
   * @param {Boolean} [options.multiple=false] - allow multiple instances of the option
   * @param {Boolean} [options.optional=true] - is option optional
   * @param {(String|Boolean)} [options.environment=true] - environment variable suffix
   *
   * @example
   * const option = new Option({
   *   name: 'foo',
   *   placeholder: 'value',
   *   description: 'the foo option',
   *   type: [ 'string' ],
   *   default: 'bar',
   *   aliases: [ 'f' ],
   *   multiple: true,
   *   environment: 'SET_FOO'
   * });
   */
  constructor(options) {
    if (!validate.isOptionsObjectValid(options)) {
      throw new Error(`Invalid option: ${options}`);
    }

    if (!validate.isNameValid(options.name)) {
      throw new Error(`Invalid option name: ${options.name}`);
    }

    const MAXIMUM_TYPES_WHEN_BOOLEAN = 1;
    if (_.some([
      !validate.isTypeValid(options.type),

      // Option can't be boolean and non boolean at the same time
      Option.isBoolean(options) && _.size(options.type) > MAXIMUM_TYPES_WHEN_BOOLEAN

    ])) {
      throw new Error(`Invalid option type: ${options.type}`);
    }

    _.defaults(options, {
      aliases: [],
      placeholder: 'value',
      multiple: false,
      environment: true,
      optional: true
    });

    if (!validate.isDescriptionValid(options.description)) {
      throw new Error(`Invalid option description: ${options.description}`);
    }

    if (!validate.isPlaceholderValid(options.placeholder)) {
      throw new Error(`Invalid option placeholder: ${options.placeholder}`);
    }

    if (!_.isNil(options.default) && !validate.isOptionValueValid(options.default, options.type)) {
      throw new Error(`Invalid option default value: ${options.default}`);
    }

    if (!validate.isAliasesValid(options.aliases) || _.includes(options.aliases, options.name)) {
      throw new Error(`Invalid option aliases: ${options.aliases}`);
    }

    if (!validate.isFlagValid(options.multiple)) {
      throw new Error(`Invalid option multiple flag: ${options.multiple}`);
    }

    if (!validate.isFlagValid(options.environment) && !validate.isEnvironmentNameValid(options.environment)) {
      throw new Error(`Invalid option environment: ${options.environment}`);
    }

    if (!validate.isFlagValid(options.optional)) {
      throw new Error(`Invalid option optional flag: ${options.optional}`);
    }

    this.name = _.trim(options.name);
    this.description = _.trim(options.description);
    this.placeholder = _.trim(options.placeholder);
    this.type = options.type;
    this.default = options.default;
    this.aliases = options.aliases;
    this.multiple = options.multiple;
    this.optional = options.optional;
    this.environment = options.environment;
  }

  /**
   * @summary Convert Option to String
   * @method
   * @public
   * @returns {String} string representation
   *
   * @example
   * const option = new Option({
   *   name: 'foo',
   *   type: [ 'string' ]
   * });
   *
   * console.log(option.toString());
   * > '--foo <value>'
   */
  toString() {
    return _.chain(this.name)
      .concat(this.aliases)
      .thru((options) => {
        return _.join(_.map(options, MODES.UNIX.optionToString), ', ');
      })
      .thru((option) => {
        return Option.isBoolean(this) ? option : `${option} <${this.placeholder}>`;
      })
      .thru((option) => {
        return this.optional ? `[${option}]` : option;
      })
      .thru((option) => {
        return this.multiple ? `${option}...` : option;
      })
      .value();
  }

}

/**
 * @summary Check if an option is boolean
 * @function
 * @public
 *
 * @param {Object} option - option
 * @returns {Boolean} whether the option is boolean
 *
 * @example
 * const option = new Option({
 *   name: 'foo',
 *   type: [ 'boolean' ]
 * });
 *
 * if (Option.isBoolean(option)) {
 *   console.log('This option is boolean');
 * }
 */
Option.isBoolean = (option) => {
  return _.includes(option.type, types.supported.BOOLEAN);
};

module.exports = Option;
