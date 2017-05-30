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
const Parameter = require('./parameter');

/**
 * @summary Check if a string is valid
 * @function
 * @private
 *
 * @param {String} string - string
 * @returns {Boolean}
 *
 * @example
 * if (isStringValid('foo')) {
 *   console.log('This string is valid');
 * }
 */
const isStringValid = (string) => {
  return _.isString(string) && !_.isEmpty(_.trim(string));
};

/**
 * @summary Check if the contents of a list are valid
 * @function
 * @private
 *
 * @param {Array} list - list
 * @param {Function} predicate - predicate
 * @returns {Boolean}
 *
 * @example
 * if (isListContentsValid([ 'foo', 'bar' ], isStringValid)) {
 *   console.log('This list is valid');
 * }
 */
const isListContentsValid = (list, predicate) => {
  return _.every([
    _.isArray(list),
    _.every(list, predicate)
  ]);
};

/**
 * @summary Check if the contents of a list are of a certain type
 * @function
 * @private
 *
 * @param {Array} list - list
 * @param {Function} type - type
 * @returns {Boolean}
 *
 * @example
 * if (isListOfType([ 1, 2 ], Number)) {
 *   console.log('This list is valid');
 * }
 */
const isListOfType = (list, type) => {
  return isListContentsValid(list, (item) => {
    return item instanceof type;
  });
};

/**
 * @summary Check if a unique list is valid
 * @function
 * @private
 *
 * @param {Array} list - list
 * @param {(Function|String)} [predicate] - predicate
 * @returns {Boolean}
 *
 * @example
 * if (isUniqueListValid([ 1, 2 ], _.identity)) {
 *   console.log('This unique list is valid');
 * }
 */
const isUniqueListValid = (list, predicate = _.identity) => {
  return _.size(_.uniqBy(list, predicate)) === _.size(list);
};

/**
 * @summary Check if an options object is valid
 * @function
 * @public
 *
 * @param {Object} options - options
 * @returns {Boolean}
 *
 * @example
 * if (validate.isOptionsValid({ foo: 'bar' })) {
 *   console.log('This options object is valid');
 * }
 */
exports.isOptionsValid = (options) => {
  return !_.isEmpty(options) && _.isPlainObject(options);
};

/**
 * @summary Check if set of options values is valid
 * @function
 * @public
 *
 * @param {Object} options - options values
 * @returns {Boolean}
 *
 * @example
 * if (validate.isOptionsValuesValid({ foo: 'bar' })) {
 *   console.log('This options values object is valid');
 * }
 */
exports.isOptionsValuesValid = (options) => {
  return _.isNil(options) || _.every([
    _.isPlainObject(options),
    _.isNil(_.find(_.values(options), _.isObject))
  ]);
};

/**
 * @summary Check if a type is valid
 * @function
 * @public
 *
 * @param {String[]} type - type
 * @returns {Boolean}
 *
 * @example
 * if (validate.isTypeValid([ 'string' ])) {
 *   console.log('This type is valid');
 * }
 */
exports.isTypeValid = (type) => {
  return _.every([
    isListContentsValid(type, isStringValid),
    !_.isEmpty(type),
    _.isEmpty(_.reject(type, types.isSupported))
  ]);
};

/**
 * @summary Check if a name is valid
 * @function
 * @public
 *
 * @param {String} name - name
 * @returns {Boolean}
 *
 * @example
 * if (validate.isNameValid('foo')) {
 *   console.log('This name is valid');
 * }
 */
exports.isNameValid = (name) => {
  const SINGLE_LETTER_OPTION_LENGTH = 1;
  const regex = _.size(name) > SINGLE_LETTER_OPTION_LENGTH
    ? /^[a-z0-9][a-z0-9-]+[a-z0-9]$/
    : /^[a-zA-Z0-9]$/;

  return isStringValid(name) && regex.test(name) && !_.includes(name, '--');
};

/**
 * @summary Check if a description is valid
 * @function
 * @public
 *
 * @param {String} description - description
 * @returns {Boolean}
 *
 * @example
 * if (validate.isDescriptionValid('my description')) {
 *   console.log('This description is valid');
 * }
 */
exports.isDescriptionValid = (description) => {
  return _.isNil(description) || isStringValid(description);
};

/**
 * @summary Check if a flag is valid
 * @function
 * @public
 *
 * @param {Boolean} flag - flag
 * @returns {Boolean}
 *
 * @example
 * if (validate.isFlagValid(true)) {
 *   console.log('This flag is valid');
 * }
 */
exports.isFlagValid = (flag) => {
  return _.isBoolean(flag);
};

/**
 * @summary Check if a command is valid
 * @function
 * @public
 *
 * @param {String[]} command - command
 * @returns {Boolean}
 *
 * @example
 * if (validate.isCommandValid([ 'foo', 'bar' ])) {
 *   console.log('This command is valid');
 * }
 */
exports.isCommandValid = (command) => {
  return isListContentsValid(command, isStringValid);
};

/**
 * @summary Check if a set of parameters is valid
 * @function
 * @public
 *
 * @param {Object[]} parameters - parameters
 * @returns {Boolean}
 *
 * @example
 * if (validate.isParametersValid([
 *   new Parameter({
 *     name: 'baz',
 *     type: [ 'string' ],
 *     description: 'baz parameter',
 *     optional: true
 *   })
 * ])) {
 *   console.log('This set of parameters is valid');
 * }
 */
exports.isParametersValid = (parameters) => {
  return isListOfType(parameters, Parameter) && isUniqueListValid(parameters, 'name');
};

/**
 * @summary Check if a set of arguments is valid
 * @function
 * @public
 *
 * @param {String[]} argv - arguments
 * @returns {Boolean}
 *
 * @example
 * if (validate.isArgumentsValid([ 'foo', 'bar' ])) {
 *   console.log('This set of arguments is valid');
 * }
 */
exports.isArgumentsValid = (argv) => {
  return _.isNil(argv) || isListContentsValid(argv, (argument) => {
    return _.some([
      types.matches(types.supported.STRING, argument) && isStringValid(argument),
      types.matches(types.supported.NUMBER, argument)
    ]);
  });
};

/**
 * @summary Check if a set of aliases are valid
 * @function
 * @public
 *
 * @param {String[]} aliases - aliases
 * @returns {Boolean}
 *
 * @example
 * if (validate.isAliasesValid([ 'f', 'b' ])) {
 *   console.log('This set of aliases is valid');
 * }
 */
exports.isAliasesValid = (aliases) => {
  return isListContentsValid(aliases, isStringValid) && isUniqueListValid(aliases);
};

/**
 * @summary Check if an option value is valid
 * @function
 * @public
 *
 * @param {*} value - value
 * @param {String[]} supportedTypes - supported types
 * @returns {Boolean}
 *
 * @example
 * if (validate.isOptionValueValid('foo', [ 'string', 'number' ])) {
 *   console.log('This option value is valid');
 * }
 */
exports.isOptionValueValid = (value, supportedTypes) => {
  return _.some(supportedTypes, (type) => {
    return types.matches(type, value);
  });
};

/**
 * @summary Check if an environment variable name is valid
 * @function
 * @public
 *
 * @param {String} name - name
 * @returns {Boolean}
 *
 * @example
 * if (validate.isEnvironmentNameValid('FOO_BAR')) {
 *   console.log('This environment variable name is valid');
 * }
 */
exports.isEnvironmentNameValid = (name) => {
  return _.every([
    isStringValid(name),
    /^[a-zA-Z_]+$/.test(name)
  ]);
};
