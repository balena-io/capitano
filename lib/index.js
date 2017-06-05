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
const parser = require('./parser');
const Command = require('./command');
const Signature = require('./signature');
const Parameter = require('./parameter');
const Example = require('./example');
const Option = require('./option');
const store = require('./store');

/**
 * @summary A curried function to create an instance of a class
 * @function
 * @private
 *
 * @param {Function} constructor - constructor
 * @returns {Function} curried function that accepts an options object
 *
 * @example
 * const instance = create(Buffer)([ 0x62, 0x75, 0x66, 0x66, 0x65, 0x72 ]);
 */
const create = (constructor) => {
  return (options) => {
    return new constructor(options);
  };
};

/**
 * @summary Set a Capitano command
 * @function
 * @public
 *
 * @param {Object} command - command
 *
 * @example
 * capitano.setCommand({
 *   signature: {
 *     command: [ 'sum' ],
 *     parameters: [
 *       {
 *         name: 'x',
 *         type: [ 'number' ],
 *         description: 'first number'
 *       },
 *       {
 *         name: 'y',
 *         type: [ 'number' ],
 *         description: 'second number'
 *       }
 *     ]
 *   },
 *   options: [
 *     {
 *       name: 'verbose',
 *       description: 'be verbose',
 *       type: [ 'boolean' ],
 *       aliases: [ 'v' ]
 *     }
 *   ],
 *   description: 'add two numbers',
 *   action: (params, options) => {
 *     const result = params.x + params.y;
 *
 *     if (options.verbose) {
 *       console.log(`Adding ${params.x} and ${params.y} = ${result}`);
 *     }
 *
 *     return Promise.resolve(result);
 *   }
 * });
 */
exports.setCommand = (command) => {
  if (command.signature.parameters) {
    command.signature.parameters = _.map(command.signature.parameters, (parameter) => {
      if (_.isString(parameter.type)) {
        parameter.type = [ parameter.type ];
      }

      return new Parameter(parameter);
    });
  }

  if (_.isString(command.signature.command)) {
    command.signature.command = [ command.signature.command ];
  }

  if (command.signature) {
    command.signature = new Signature(command.signature);
  }

  if (command.examples) {
    command.examples = _.map(command.examples, create(Example));
  }

  if (command.options) {
    command.options = _.map(command.options, create(Option));
  }

  store.set(new Command(command));
};

/**
 * @summary Run a Capitano application
 * @function
 * @public
 *
 * @param {String[]} argv - arguments
 * @fulfil {*} - command result
 * @returns {Promise}
 *
 * @example
 * capitano.setCommand({ ... });
 * capitano.setCommand({ ... });
 * capitano.setCommand({ ... });
 *
 * capitano.run(process.argv.slice(2)).then((result) => {
 *   console.log(result);
 * });
 */
exports.run = (argv) => {
  const combinations = parser.parse(argv);
  const matches = _.reduce(combinations, (accumulator, combination) => {
    const possibleMatches = store.look(combination.command);

    _.each(possibleMatches, (match) => {
      const values = Command.compile(match, combination);

      if (!_.isNil(values)) {
        accumulator.push({
          command: match,
          params: values.params,
          options: values.options
        });
      }
    });

    return accumulator;
  }, []);

  const AMBIGUOUS_COMMAND_MINIMUM_SIZE = 2;
  if (_.size(matches) >= AMBIGUOUS_COMMAND_MINIMUM_SIZE) {
    throw new Error('Ambiguous!');
  }

  const match = _.first(matches);
  return match.command.action(match.params, match.options);
};
