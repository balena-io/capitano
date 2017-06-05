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
 * @summary Check if an argument represents a short option
 * @function
 * @public
 *
 * @param {String} argument - argument
 * @param {Object} options - options
 * @param {Object} options.mode - mode
 * @returns {Boolean} whether the argument represents a short option
 *
 * @example
 * if (argument.isShortOption('-f', {
 *   mode: MODES.UNIX
 * })) {
 *   console.log('This argument is a short option');
 * }
 */
exports.isShortOption = (argument, options) => {
  return _.invoke(options, [ 'mode', 'optionShort', 'test' ], argument);
};

/**
 * @summary Check if an argument represents a long option
 * @function
 * @public
 *
 * @param {String} argument - argument
 * @param {Object} options - options
 * @param {Object} options.mode - mode
 * @returns {Boolean} whether the argument represents a long option
 *
 * @example
 * if (argument.isLongOption('--foo', {
 *   mode: MODES.UNIX
 * })) {
 *   console.log('This argument is a long option');
 * }
 */
exports.isLongOption = (argument, options) => {
  return _.invoke(options, [ 'mode', 'optionLong', 'test' ], argument);
};

/**
 * @summary Check if an argument represents an option
 * @function
 * @public
 *
 * @param {String} argument - argument
 * @param {Object} options - options
 * @param {Object} options.mode - mode
 * @returns {Boolean} whether the argument represents an option
 *
 * @example
 * if (argument.isOption('--foo', {
 *   mode: MODES.UNIX
 * })) {
 *   console.log('This argument is an option');
 * }
 */
exports.isOption = (argument, options) => {
  return _.some([
    exports.isShortOption(argument, options),
    exports.isLongOption(argument, options)
  ]);
};

/**
 * @summary Get the name of an argument
 * @function
 * @public
 *
 * @param {String} argument - argument
 * @param {Object} options - options
 * @param {Object} options.mode - mode
 * @returns {String} the argument name
 *
 * @example
 * const name = argument.getName('--foo', {
 *   modes: MODES.UNIX
 * });
 *
 * console.log(name);
 * > 'foo'
 */
exports.getName = (argument, options) => {
  const OPTION_NAME_CAPTURE_GROUP = 1;

  if (exports.isShortOption(argument, options)) {
    return _.nth(argument.match(options.mode.optionShort), OPTION_NAME_CAPTURE_GROUP);
  }

  if (exports.isLongOption(argument, options)) {
    return _.nth(argument.match(options.mode.optionLong), OPTION_NAME_CAPTURE_GROUP);
  }

  return argument;
};
