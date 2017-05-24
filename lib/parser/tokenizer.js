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
const argument = require('./argument');

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
 * @summary Check if a token represents an option
 * @function
 * @public
 *
 * @param {Object} token - token
 * @returns {Boolean} whether the token represents an option
 *
 * @example
 * const token = _.first(tokenizer.tokenize([ '-f' ], {
 *   mode: MODES.UNIX
 * }));
 *
 * if (tokenizer.isOption(token)) {
 *   console.log('The token represents an option');
 * }
 */
exports.isOption = (token) => {
  return _.get(token, [ 'type' ]) === exports.TYPES.OPTION;
};

/**
 * @summary Check if a token represents a word
 * @function
 * @public
 *
 * @param {Object} token - token
 * @returns {Boolean} whether the token represents a word
 *
 * @example
 * const token = _.first(tokenizer.tokenize([ 'foo' ], {
 *   mode: MODES.UNIX
 * }));
 *
 * if (tokenizer.isWord(token)) {
 *   console.log('The token represents a word');
 * }
 */
exports.isWord = (token) => {
  return _.get(token, [ 'type' ]) === exports.TYPES.WORD;
};

/**
 * @summary Get the type of an argument
 * @function
 * @public
 *
 * @param {String} string - argument string
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
exports.getArgumentType = (string, options) => {
  if (string === options.mode.endOfParameterSymbol) {
    return exports.TYPES.EOP;
  } else if (argument.isOption(string, options)) {
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
 * @public
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
  const PREVIOUS_TOKEN_OFFSET = -1;
  return getRelativeToken(tokens, index, PREVIOUS_TOKEN_OFFSET);
};

/**
 * @summary Get next token
 * @function
 * @public
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
  const NEXT_TOKEN_OFFSET = 1;
  return getRelativeToken(tokens, index, NEXT_TOKEN_OFFSET);
};

/**
 * @summary Get the name of a token
 * @function
 * @public
 *
 * @param {Object} token - token
 * @returns {String} token name
 *
 * @example
 * const token = _.first(tokenizer.tokenize([ 'foo' ], {
 *   mode: MODES.UNIX
 * }));
 *
 * console.log(tokenizer.getName(token));
 * > 'foo'
 */
exports.getName = (token) => {
  return _.get(token, [ 'name' ]);
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
    .reduce((accumulator, string) => {
      const type = exports.getArgumentType(string, options);

      if (type === exports.TYPES.EOP) {
        return {
          result: accumulator.result,
          parse: false
        };
      }

      const token = accumulator.parse ? {
        type,
        name: argument.getName(string, options)
      } : {
        type: exports.TYPES.WORD,
        name: string
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

    // Ensure we can reconstruct the original position
    // of the tokens even if we modify the array
    .map((token, index) => {
      token.index = index;
      return token;
    })

    .value();
};
