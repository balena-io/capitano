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

const MODES = require('./modes');
const matching = require('./matching');
const tokenizer = require('./tokenizer');

/**
 * @summary Parse a set of arguments
 * @function
 * @public
 *
 * @param {String[]} argv - arguments
 * @param {String} [mode=MODES.UNIX] - parsing mode
 * @returns {Object[]} valid combinations
 *
 * @example
 * const combinations = parser.parse([ '-v', 'foo' ]);
 *
 * _.each(combinations, (combination) => {
 *   console.log(combination.command);
 *   console.log(combination.options);
 * });
 */
exports.parse = (argv, mode = MODES.UNIX) => {
  const tokens = tokenizer.tokenize(argv, { mode });
  return matching.getValidCombinations(tokens);
};
