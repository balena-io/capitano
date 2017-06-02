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

const ava = require('ava');
const _ = require('lodash');
const words = require('../lib/words');
const types = require('../lib/types');

_.each([
  [ true, '1' ],
  [ true, '8.5' ],
  [ true, '-5' ],
  [ true, '-3.2' ],
  [ true, '0' ],
  [ false, '1aa' ],
  [ false, 'foo' ],
  [ false, 'a999' ]
], (testCase) => {
  const [ expected, word ] = testCase;

  ava.test(`lookslikeNumber: should return ${expected} for ${word}`, (test) => {
    test.is(words.lookslikeNumber(word), expected);
  });
});

_.each([
  [ 'foo', [ types.supported.STRING ], 'foo' ],
  [ 'true', [ types.supported.STRING ], 'true' ],
  [ '', [ types.supported.STRING ], '' ],

  [ '1', [ types.supported.STRING ], '1' ],
  [ '5.55', [ types.supported.STRING ], '5.55' ],
  [ '-3', [ types.supported.STRING ], '-3' ],
  [ '0', [ types.supported.STRING ], '0' ],

  [ '1', [ types.supported.NUMBER ], 1 ],
  [ '5.55', [ types.supported.NUMBER ], 5.55 ],
  [ '-3', [ types.supported.NUMBER ], -3 ],
  [ '0', [ types.supported.NUMBER ], 0 ],

  [ 'foo', [ types.supported.NUMBER ], null ],
  [ 'true', [ types.supported.NUMBER ], null ],
  [ '', [ types.supported.NUMBER ], null ],

  [ '1', [ types.supported.STRING, types.supported.NUMBER ], 1 ],
  [ '5.55', [ types.supported.STRING, types.supported.NUMBER ], 5.55 ],
  [ '-3', [ types.supported.STRING, types.supported.NUMBER ], -3 ],
  [ '0', [ types.supported.STRING, types.supported.NUMBER ], 0 ],

  [ 'true', [ types.supported.BOOLEAN ], true ],
  [ 'false', [ types.supported.BOOLEAN ], false ],
  [ 'true', [ types.supported.BOOLEAN, types.supported.STRING ], true ],
  [ 'false', [ types.supported.BOOLEAN, types.supported.STRING ], false ],

  [ 'foo', [ types.supported.BOOLEAN ], null ],
  [ 'True', [ types.supported.BOOLEAN ], null ],
  [ 'False', [ types.supported.BOOLEAN ], null ]
], (testCase) => {
  const [ word, type, expected ] = testCase;

  ava.test(`evaluate: should evaluate "${word}" as "${expected}" when type=${type}`, (test) => {
    test.is(words.evaluate(type, word), expected);
  });
});
