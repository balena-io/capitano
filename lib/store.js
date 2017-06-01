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
const wildcard = require('./wildcard');

/**
 * @summary Create an empty node
 * @function
 * @private
 *
 * @returns {Object} empty node
 *
 * @example
 * const node = createEmptyNode();
 */
const createEmptyNode = () => {
  return {
    value: null,
    children: {}
  };
};

// The store implements the `trie` data structure, however
// the traversal implementation has been tweaked to support
// optional and variadic parameters, as well as find all the
// possible paths on the tree.

/**
 * @summary Store nodes
 * @constant
 * @private
 * @type {Object}
 */
const nodes = {
  root: createEmptyNode()
};

/**
 * @summary Clear the store
 * @function
 * @private
 *
 * @description
 * For internal unit testing purposes.
 *
 * @example
 * store.clear();
 */
exports.clear = () => {
  nodes.root = createEmptyNode();
};

/**
 * @summary Store a command
 * @function
 * @public
 *
 * @param {Object} command - command
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
 *   action: (params, options, context) => {
 *     console.log('Do something...');
 *     return Promise.resolve();
 *   }
 * });
 *
 * store.set(command);
 */
exports.set = (command) => {
  const path = _.chain(command.signature.command)
    .concat(_.map(command.signature.parameters, wildcard.fromParameter))
    .value();

  let node = nodes.root;

  _.each(path, (name) => {
    node.children[name] = node.children[name] || createEmptyNode();
    node = node.children[name];
  });

  node.value = command;
};

/**
 * @summary Look for a command on the store
 * @function
 * @public
 *
 * @description
 * This function returns an empty array if no command
 * that matches the passed arguments exists in the store.
 *
 * @param {String[]} argv - arguments
 * @param {Object} [node] - start node (defaults to the root node) (for internal use only)
 * @returns {Object[]} commands
 *
 * @example
 * const commands = store.look([ 'foo', 'bar' ]);
 *
 * if (_.isEmpty(commands)) {
 *   console.log('No commands were found!');
 * }
 *
 * _.each(commands, (command) => {
 *   console.log(command);
 * });
 */
exports.look = (argv, node = nodes.root) => {
  const head = _.first(argv);
  const next = _.filter(node.children, (child, name) => {
    if (_.isEmpty(argv) && wildcard.matches(name, argv)) {
      return true;
    }

    return head === name || wildcard.matches(name, [ head ]);
  });

  if (_.isEmpty(next) && _.isEmpty(argv)) {
    return _.compact([ node.value ]);
  }

  return _.flatMap(next, (child) => {
    return exports.look(_.tail(argv), child);
  });
};
