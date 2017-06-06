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

/**
 * @summary Linearly execute a chain of middlewares
 * @function
 * @public
 *
 * @param {Any[]} args - arguments for each middleware
 * @param {Promise[]} middlewares - middleware promises
 * @returns {Promise}
 *
 * @example
 * middlewares.execute([ 1, 2, 3 ], [
 *   (one, two, three) => {
 *     if (three < two) {
 *       throw new Error('Middleware error!');
 *     }
 *   }
 *   (one, two, three) => {
 *     console.log('All good');
 *   }
 * ]).then(() => {
 *   console.log('The chain exit successfully');
 * });
 */
exports.execute = (args, middlewares) => {
  let result = Promise.resolve();

  _.each(middlewares, (middleware) => {
    result = result.then(() => {
      return Reflect.apply(middleware, this, args);
    });
  });

  return result;
};
