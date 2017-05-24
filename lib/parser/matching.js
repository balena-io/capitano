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
const generatorics = require('generatorics');
const tokenizer = require('./tokenizer');

/**
 * @summary Get command from option values
 * @function
 * @private
 *
 * @param {Object[]} tokens - argument tokens
 * @param {Object} options - options
 * @returns {String[]} command
 *
 * @example
 * const command = matching.getCommandFromOptionValues(tokenizer.tokenize([ 'foo', '-b', 'baz' ]), {
 *   b: true
 * });
 *
 * console.log(command);
 * > [ 'foo', 'baz' ]
 */
exports.getCommandFromOptionValues = (tokens, options) => {
  return _.reduce(tokens, (accumulator, token) => {
    if (tokenizer.isWord(token)) {
      const previousToken = tokenizer.getPreviousToken(tokens, token.index);
      const name = tokenizer.getName(token);
      const previousTokenName = tokenizer.getName(previousToken);

      if (_.some([
        !tokenizer.isOption(previousToken),
        tokenizer.isOption(previousToken) && options[previousTokenName] !== name
      ])) {
        return _.concat(accumulator, [ name ]);
      }
    }

    return accumulator;
  }, []);
};

/**
 * @summary Classify option tokens
 * @function
 * @private
 *
 * @description
 * This function classifies tokens in two groups:
 *
 * - `ambiguous`
 * - `boolean`
 *
 * @param {Object[]} tokens - tokens
 * @returns {Object} classified tokens
 *
 * @example
 * const options = matching.classifyOptions(tokenizer.tokenize([ '-f', '--foo' '-x' ], {
 *   mode: MODES.UNIX
 * }));
 *
 * console.dir(options.ambiguous);
 * console.dir(options.boolean);
 */
exports.classifyOptions = (tokens) => {
  return _.reduce(tokens, (accumulator, token) => {
    if (!tokenizer.isOption(token)) {
      return accumulator;
    }

    const name = tokenizer.getName(token);
    const isBoolean = !_.isNil(_.find(accumulator.boolean, { name }));

    if (tokenizer.isWord(tokenizer.getNextToken(tokens, token.index)) && !isBoolean) {
      accumulator.ambiguous.push(token);
    } else if (!isBoolean) {
      accumulator.boolean.push(token);

      // If an option is passed more than once, and the first time its ambiguous,
      // but the next time we know for sure it must be boolean, then we must
      // remove it from the ambiguous class
      accumulator.ambiguous = _.reject(accumulator.ambiguous, { name });

    }

    return accumulator;
  }, {
    ambiguous: [],
    boolean: []
  });
};

/**
 * @summary Get valid combinations from an ambiguous set of arguments
 * @function
 * @public
 *
 * @description
 * This algorithm is able to calculate all the possible combinations
 * of ambiguous commands, so we can use this information to determine
 * which command it really corresponds too.
 *
 * Each combination contains two properties:
 *
 * - String[] command
 * - Object options
 *
 * If the command is not ambiguous, then a single combination will be
 * returned.
 *
 * @param {Object[]} tokens - tokens
 * @returns {Object[]} valid combinations
 *
 * @example
 * const combinations = matching.getValidCombinations(tokenizer.tokenize([
 *   '-v',
 *   'foo',
 *   'bar'
 * ], {
 *   mode: MODES.UNIX
 * }));
 *
 * console.dir(combinations);
 *
 * [
 *   {
 *     command: [ 'foo', 'bar' ],
 *     options: {
 *       v: true
 *     }
 *   },
 *   {
 *     command: [ 'bar' ],
 *     options: {
 *       v: 'foo'
 *     }
 *   }
 * ]
 */
exports.getValidCombinations = (tokens) => {
  const options = exports.classifyOptions(tokens);
  const combinations = [];

  const booleanOptionPairs = _.map(options.boolean, (option) => {
    return [ tokenizer.getName(option), true ];
  });

  for (const combination of generatorics.baseN([ false, true ], _.size(options.ambiguous))) {
    const finalOptions = _.chain(combination)
      .map((value, index) => {
        const option = _.get(options, [ 'ambiguous', index ]);
        const nextToken = tokenizer.getNextToken(tokens, option.index);

        return [
          tokenizer.getName(option),
          value || tokenizer.getName(nextToken)
        ];
      })
      .concat(booleanOptionPairs)
      .fromPairs()
      .value();

    combinations.push({
      options: finalOptions,
      command: exports.getCommandFromOptionValues(tokens, finalOptions)
    });
  }

  return combinations;
};
