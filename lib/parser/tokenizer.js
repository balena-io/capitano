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
 * @summary Token types
 * @namespace TYPES
 * @public
 */
exports.TYPES = {

  /**
   * @property {Object} WORD
   * @memberof TYPES
   * @description
   * The word token type.
   */
  WORD: 'word',

  /**
   * @property {Object} WORD
   * @memberof TYPES
   * @description
   * The option token type.
   */
  OPTION: 'option',

  /**
   * @property {Object} EOP
   * @memberof TYPES
   * @description
   * The end-of-parameter token type.
   */
  EOP: 'eop'

};

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
 * if (tokenizer.isShortOption('-f', {
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
 * if (tokenizer.isLongOption('--foo', {
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
 * if (tokenizer.isOption('--foo', {
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
 * const name = tokenizer.getArgumentName('--foo', {
 *   modes: MODES.UNIX
 * });
 *
 * console.log(name);
 * > 'foo'
 */
exports.getArgumentName = (argument, options) => {
  const OPTION_NAME_CAPTURE_GROUP = 1;

  if (exports.isShortOption(argument, options)) {
    return _.nth(argument.match(options.mode.optionShort), OPTION_NAME_CAPTURE_GROUP);
  }

  if (exports.isLongOption(argument, options)) {
    return _.nth(argument.match(options.mode.optionLong), OPTION_NAME_CAPTURE_GROUP);
  }

  return argument;
};

/**
 * @summary Get the type of an argument
 * @function
 * @public
 *
 * @param {String} argument - argument
 * @param {Object} options - options
 * @param {Object} options.mode - mode
 * @returns {String} the argument type
 *
 * @example
 * const type = tokenizer.getArgumentType('--foo', {
 *   modes: MODES.UNIX
 * });
 *
 * console.log(type === tokenizer.TYPES.OPTION);
 * > true
 */
exports.getArgumentType = (argument, options) => {
  if (argument === options.mode.endOfParameterSymbol) {
    return exports.TYPES.EOP;
  } else if (exports.isOption(argument, options)) {
    return exports.TYPES.OPTION;
  }

  return exports.TYPES.WORD;
};

/**
 * @summary Get relative token
 * @function
 * @private
 *
 * @param {Object[]} tokens - tokens
 * @param {Number} index - token index
 * @param {Number} offset - offset from `index`
 * @returns {(Object|Null)} token
 *
 * @example
 * const token = getRelativeToken(tokenizer.tokenize([ 'foo', 'bar' ], {
 *   mode: MODES.UNIX
 * }), 0, 1);
 *
 * console.log(token.name);
 * > 'bar'
 */
const getRelativeToken = (tokens, index, offset) => {
  const token = _.find(tokens, {
    index
  });

  if (_.isNil(token)) {
    return null;
  }

  return _.find(tokens, {
    index: token.index + offset
  }) || null;
};

/**
 * @summary Get previous token
 * @function
 * @private
 *
 * @param {Object[]} tokens - tokens
 * @param {Number} index - token index
 * @returns {(Object|Null)} token
 *
 * @example
 * const token = tokenizer.getPreviousToken(tokenizer.tokenize([ 'foo', 'bar' ], {
 *   mode: MODES.UNIX
 * }), 1);
 *
 * console.log(token.name);
 * > 'foo'
 */
exports.getPreviousToken = (tokens, index) => {
  return getRelativeToken(tokens, index, -1);
};

/**
 * @summary Get next token
 * @function
 * @private
 *
 * @param {Object[]} tokens - tokens
 * @param {Number} index - token index
 * @returns {(Object|Null)} token
 *
 * @example
 * const token = tokenizer.getNextToken(tokenizer.tokenize([ 'foo', 'bar' ], {
 *   mode: MODES.UNIX
 * }), 0);
 *
 * console.log(token.name);
 * > 'bar'
 */
exports.getNextToken = (tokens, index) => {
  return getRelativeToken(tokens, index, 1);
};

/**
 * @summary Tokenize a set of arguments
 * @function
 * @public
 *
 * @param {String[]} argv - arguments
 * @param {Object} options - options
 * @param {Object} options.mode - mode
 * @returns {Object[]} tokenized arguments
 *
 * @example
 * tokenizer.tokenize([ '-o', 'foo.txt' ], {
 *   modes: MODES.UNIX
 * }).forEach((token) => {
 *   console.log(token.type);
 *   console.log(token.name);
 *   console.log(token.index);
 * });
 */
exports.tokenize = (argv, options) => {
  return _.chain(argv)
    .reduce((accumulator, argument) => {
      const type = exports.getArgumentType(argument, options);

      if (type === exports.TYPES.EOP) {
        return {
          result: accumulator.result,
          parse: false
        };
      }

      const token = accumulator.parse ? {
        type,
        name: exports.getArgumentName(argument, options)
      } : {
        type: exports.TYPES.WORD,
        name: argument
      };

      return {
        result: _.concat(accumulator.result, [ token ]),
        parse: accumulator.parse
      };
    }, {
      result: [],
      parse: true
    })
    .get([ 'result' ])
    .map((token, index) => {
      token.index = index;
      return token;
    })
    .value();
};
