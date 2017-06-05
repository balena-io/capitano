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
 * @summary Check if a word looks like a number
 * @function
 * @private
 * @license MIT
 *
 * @description
 * Adapted from https://github.com/substack/minimist.
 *
 * @param {String} word - word
 * @returns {Boolean} whether the word looks like a number
 *
 * @example
 */
exports.lookslikeNumber = (word) => {
  return _.every([
    /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(word),
    _.isFinite(parseFloat(word))
  ]);
};

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
      return _.some([
        type === types.supported.NUMBER && exports.lookslikeNumber(word),
        types.matches(type, word)
      ]);
    });
  });
};

/**
 * @summary Evaluate a word
 * @function
 * @public
 *
 * @param {String[]} type - type
 * @param {String} word - word
 * @returns {(Null|String|Number|Boolean)} result
 *
 * @example
 * const result = words.evaluate([ types.supported.NUMBER ], '3.14');
 * console.log(result);
 * > 3.14
 */
exports.evaluate = (type, word) => {
  if (_.includes(type, types.supported.BOOLEAN) && /^(true|false)$/.test(word)) {
    return JSON.parse(word);
  }

  if (_.includes(type, types.supported.NUMBER)) {
    const value = parseFloat(word);
    if (!_.isNaN(value)) {
      return value;
    }
  }

  if (_.includes(type, types.supported.STRING)) {
    return word;
  }

  return null;
};