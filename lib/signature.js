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
const Parameter = require('./parameter');

/**
 * @summary Signature class
 * @public
 * @class
 */
class Signature {

  /**
   * @summary Create an instance of Signature
   * @name Signature
   * @class
   * @public
   *
   * @param {Object} options - options
   * @param {String[]} [options.command] - signature command words
   * @param {Object[]} [options.parameters] - signature command parameters
   *
   * @example
   * const signature = new Signature({
   *   command: [ 'foo', 'bar' ],
   *   parameters: [
   *     new Parameter({
   *       name: 'baz',
   *       type: [ 'string' ],
   *       description: 'baz parameter',
   *       optional: true
   *     })
   *   ]
   * });
   */
  constructor(options) {
    if (!_.isArray(options.command) || !_.every(options.command, _.isString)) {
      throw new Error(`Invalid signature command: ${options.command}`);
    }

    _.defaults(options, {
      parameters: []
    });

    if (_.some([
      !_.isArray(options.parameters),
      !_.every(options.parameters, (parameter) => {
        return parameter instanceof Parameter;
      })
    ])) {
      throw new Error(`Invalid signature parameters: ${options.parameters}`);
    }

    const firstOptionalIndex = _.findIndex(options.parameters, Parameter.isOptional);
    const requiredIndexAfterOptional = _.findIndex(options.parameters, Parameter.isRequired, firstOptionalIndex);
    const INDEX_NOT_FOUND = -1;
    if (firstOptionalIndex !== INDEX_NOT_FOUND && requiredIndexAfterOptional > firstOptionalIndex) {
      throw new Error('Invalid signature parameters: required parameter after an optional parameter');
    }

    const firstVariadicIndex = _.findIndex(options.parameters, Parameter.isVariadic);
    const INDEX_SIZE_DIFFERENCE = 1;
    if (firstVariadicIndex !== INDEX_NOT_FOUND && firstVariadicIndex !== _.size(options.parameters) - INDEX_SIZE_DIFFERENCE) {
      throw new Error('Invalid signature parameters: parameter after a variadic parameter');
    }

    this.command = _.map(options.command, _.trim);
    this.parameters = options.parameters;
  }

}

/**
 * @summary Check if a set of arguments match a signature command
 * @function
 * @private
 *
 * @param {String[]} command - signature command
 * @param {String[]} argv - argv
 * @returns {Boolean} whether the arguments match the signature command
 *
 * @example
 * if (matchesCommand([ 'foo', 'bar' ], [ 'foo', 'bar', 'baz' ])) {
 *   console.log('The arguments match the signature command');
 * }
 */
const matchesCommand = (command, argv) => {
  return _.isEqual(_.take(argv, _.size(command)), command);
};

Signature.matches = (signature, argv) => {
  if (!matchesCommand(signature.command, argv)) {
    return false;
  }

  const args = _.slice(argv, _.size(signature.command));

  const matches = _.reduce(signature.parameters, (accumulator, parameter, index) => {
    const words = Parameter.isVariadic(parameter)
      ? _.slice(args, index)
      : _.compact([ _.nth(args, index) ]);

    return {
      pairs: _.concat(accumulator.pairs, [ [ words, parameter ] ]),
      arguments: accumulator.arguments + _.size(words)
    };
  }, {
    pairs: [],
    arguments: 0
  });

  if (_.some([
    !_.isEmpty(matches.pairs) && _.size(matches.pairs) < _.size(signature.parameters),
    matches.arguments < _.size(args)
  ])) {
    return false;
  }

  return _.every(matches.pairs, ([ words, parameter ]) => {
    return Parameter.matches(parameter, words);
  });
};

module.exports = Signature;
