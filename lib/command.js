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
const stripIndent = require('strip-indent');
const validate = require('./validate');
const Signature = require('./signature');

/**
 * @summary Command class
 * @public
 * @class
 */
class Command {

  /**
   * @summary Create an instance of Command
   * @name Command
   * @class
   * @public
   *
   * @param {Object} options - options
   * @param {Object} options.signature - command signature
   * @param {String} [options.description] - command description
   * @param {String} [options.help] - command extended help string
   * @param {Object[]} [options.examples] - command examples
   * @param {Object[]} [options.options] - command options
   * @param {Function[]} [options.middlewares] - command middlewares
   * @param {Function} options.action - command action
   *
   * @example
   * const command = new Command({
   *   signature: new Signature({
   *     command: [ 'foo', 'bar' ],
   *     parameters: [
   *       new Parameter({
   *         name: 'baz',
   *         type: [ 'string' ],
   *         description: 'baz parameter',
   *         optional: true
   *       })
   *     ]
   *   }),
   *   description: 'the foo bar command',
   *   help: `
   *     This is the extended description of the foo bar command.
   *     This is a good place to explain the command in more detail.
   *   `,
   *   examples: [
   *     new Example({
   *       parameters: [ 'hello' ],
   *       description: 'passing hello',
   *       options: {
   *         yes: true
   *       }
   *     })
   *   ],
   *   options: [
   *     new Option({
   *       name: 'yes',
   *       description: 'the yes option',
   *       type: [ 'boolean' ],
   *       default: false,
   *       aliases: [ 'y' ]
   *     })
   *   ],
   *   action: (params, options, context) => {
   *     console.log('Do something...');
   *     return Promise.resolve();
   *   }
   * });
   */
  constructor(options) {
    if (!validate.isOptionsObjectValid(options)) {
      throw new Error(`Invalid command: ${options}`);
    }

    if (!(options.signature instanceof Signature)) {
      throw new Error(`Invalid command signature: ${options.signature}`);
    }

    if (!validate.isDescriptionValid(options.description)) {
      throw new Error(`Invalid command description: ${options.description}`);
    }

    if (!validate.isHelpValid(options.help)) {
      throw new Error(`Invalid command help: ${options.help}`);
    }

    if (!validate.isExamplesValid(options.examples)) {
      throw new Error(`Invalid command examples: ${options.examples}`);
    }

    if (!validate.isOptionsValid(options.options)) {
      throw new Error(`Invalid command options: ${options.options}`);
    }

    if (!validate.isMiddlewaresValid(options.middlewares)) {
      throw new Error(`Invalid command middlewares: ${options.middlewares}`);
    }

    if (!_.isFunction(options.action)) {
      throw new Error(`Invalid command action: ${options.action}`);
    }

    this.signature = options.signature;
    this.description = _.trim(options.description);

    if (!_.isNil(options.help)) {
      this.help = _.trim(stripIndent(options.help));
    }

    this.examples = options.examples;
    this.options = options.options;
    this.custom = options.custom;
    this.middlewares = options.middlewares;
    this.action = options.action;
  }

}

module.exports = Command;
