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
const capitano = require('../..');

capitano.setCommand(require('./commands/greet'));
capitano.setCommand(require('./commands/add'));

capitano.run(process.argv.slice(2)).then((result) => {
  console.log(JSON.stringify({ result }));
}).catch((error) => {
  console.error(error.message);
  const exitCode = _.isNumber(error.code) ? error.code : 1;
  process.exit(exitCode);
});
