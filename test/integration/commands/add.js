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

module.exports = {
  signature: {
    command: 'add',
    parameters: [
      {
        name: 'x',
        type: 'number',
        description: 'first number',
        optional: false
      },
      {
        name: 'y',
        type: 'number',
        description: 'second number',
        optional: false
      }
    ]
  },
  middlewares: [
    (params) => {
      if (params.x > 100 || params.y > 100) {
        throw new Error('The numbers are too big!');
      }
    }
  ],
  description: 'add two numbers',
  action: (params) => {
    return Promise.resolve(params.x + params.y);
  }
};
