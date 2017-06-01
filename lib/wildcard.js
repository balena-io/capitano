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
const words = require('./words');

/**
 * @summary Wildcard regular expression
 * @type {RegExp}
 * @constant
 * @private
 */
const REGEX_WILDCARD = /^[[<]([a-z,]+)(\.\.\.)?[\]>]$/;

/**
 * @summary Optional wildcard regular expression
 * @type {RegExp}
 * @constant
 * @private
 */
const REGEX_WILDCARD_OPTIONAL = /^\[.*\]$/;

/**
 * @summary Variadic wildcard regular expression
 * @type {RegExp}
 * @constant
 * @private
 */
const REGEX_WILDCARD_VARIADIC = /^[[<][a-z,]+\.\.\.[\]>]$/;

/**
 * @summary Wildcard regular expression types capture group
 * @type {Number}
 * @constant
 * @private
 */
const REGEX_WILDCARD_CAPTURE_GROUP_TYPES = 1;

/**
 * @summary Wildcard types separator
 * @type {String}
 * @constant
 * @private
 */
const SEPARATOR_TYPES = ',';

/**
 * @summary Create a wildcard from a Parameter
 * @function
 * @public
 *
 * @param {Object} parameter - parameter
 * @returns {String} wildcard
 *
 * @example
 * console.log(wildcard.fromParameter(new Parameter({
 *   name: 'foo',
 *   type: [ 'string' ],
 *   optional: false,
 *   variadic: false
 * })));
 * > '<string>'
 */
exports.fromParameter = (parameter) => {

  // Let's abuse the Parameter#toString() method
  // for this purpose by dynamically changing the
  // parameter type.
  return Reflect.apply(parameter.toString, {
    name: _.join(parameter.type, SEPARATOR_TYPES),
    optional: parameter.optional,
    variadic: parameter.variadic
  }, []);

};

/**
 * @summary Get the types of a wildcard string
 * @function
 * @private
 *
 * @param {String} string - string
 * @returns {(String[]|Null)} the wildcard types
 *
 * @example
 * const types = wildcard.getTypes('<string>');
 *
 * if (_.isNil(types)) {
 *   console.log('The wildcard string is invalid');
 * }
 *
 * console.log(types);
 */
exports.getTypes = (string) => {
  return _.chain(string)
    .invoke([ 'match' ], REGEX_WILDCARD)
    .nth(REGEX_WILDCARD_CAPTURE_GROUP_TYPES)
    .split(SEPARATOR_TYPES)
    .thru((wildcardTypes) => {
      return _.every(wildcardTypes, types.isSupported)
        ? wildcardTypes
        : null;
    })
    .value();
};

/**
 * @summary Parse a wildcard string
 * @function
 * @private
 *
 * @param {String} wildcard - wildcard
 * @returns {(Object|Null)} parsed string
 *
 * @example
 * const parsedWildcard = wildcard.parse('<string>');
 *
 * if (_.isNil(parsedWildcard)) {
 *   console.log('The wildcard string is invalid');
 * }
 *
 * console.log(parsedWildcard.type);
 * console.log(parsedWildcard.optional);
 * console.log(parsedWildcard.variadic);
 */
exports.parse = (wildcard) => {
  const wildcardTypes = exports.getTypes(wildcard);

  if (_.isNil(wildcardTypes)) {
    return null;
  }

  return {
    type: wildcardTypes,
    optional: REGEX_WILDCARD_OPTIONAL.test(wildcard),
    variadic: REGEX_WILDCARD_VARIADIC.test(wildcard)
  };
};

/**
 * @summary Check if a set of arguments match a wildcard
 * @function
 * @public
 *
 * @param {String} wildcard - wildcard
 * @param {String[]} argv - arguments
 * @returns {Boolean} whether the arguments match the wildcard
 *
 * @example
 * if (wildcard.matches('<string>', [ 'foo' ])) {
 *   console.log('The arguments match');
 * }
 */
exports.matches = (wildcard, argv) => {
  return words.matches(argv, exports.parse(wildcard));
};

