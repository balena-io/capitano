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

exports.getValidPermutations = (tokens) => {
  const optionsIndexes = _.reduce(tokens, (accumulator, token, index) => {
    if (token.type === tokenizer.TYPES.OPTION) {
      return _.concat(accumulator, [ index ]);
    }

    return accumulator;
  }, []);

  const combinations = [];
  for (const combination of generatorics.baseN([ false, true ], _.size(optionsIndexes))) {
    const tokensCopy = _.cloneDeep(tokens);

    _.each(combination, (value, index) => {
      tokensCopy[optionsIndexes[index]].boolean = value;
    });

    combinations.push(tokensCopy);
  }

  return combinations;
};
