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

/**
 * @summary Check if a set of words match certain options
 * @function
 * @public
 *
 * @param {String[]} words - words
 * @param {Object} options - options
 * @param {String[]} options.type - type
 * @param {Boolean} options.optional - is word optional
 * @param {Boolean} options.variadic - is word variadic
 * @returns {Boolean} whether the words match the specified options
 *
 * @example
 * if (words.matches([ 'foo' ], {
 *   type: [ 'string' ],
 *   optional: true,
 *   variadic: false
 * })) {
 *   console.log('The word matches');
 * }
 */
exports.matches = (words, options) => {
  const VARIADIC_MINIMUM_WORD_SIZE = 2;

  if (_.some([
    !_.get(options, [ 'variadic' ]) && _.size(words) >= VARIADIC_MINIMUM_WORD_SIZE,
    !_.get(options, [ 'optional' ]) && _.isEmpty(words)
  ])) {
    return false;
  }

  return _.every(words, (word) => {
    return _.some(_.get(options, [ 'type' ]), (type) => {
      return types.matches(type, word);
    });
  });
};
