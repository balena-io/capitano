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
const tokenizer = require('../../lib/parser/tokenizer');
const matching = require('../../lib/parser/matching');
const MODES = require('../../lib/parser/modes');

// -v foo -b bar -t

// -v=foo -b=bar -t
// -v=foo -b bar -t
// -v foo -b bar -t
// -v foo -b=bar -t
// for (var x of generatorics.baseN([ false, true ], 3)) console.log(x)
//

ava.test('getValidCombinations: should combinate an ambiguous command with a leading option', (test) => {
  test.deepEqual(matching.getValidCombinations(tokenizer.tokenize([
    '-v',
    'foo',
    'bar'
  ], {
    mode: MODES.UNIX
  })), [
    [
      {
        type: tokenizer.TYPES.OPTION,
        boolean: false,
        name: 'v'
      },
      {
        type: tokenizer.TYPES.WORD,
        name: 'foo'
      },
      {
        type: tokenizer.TYPES.WORD,
        name: 'bar'
      }
    ],
    [
      {
        type: tokenizer.TYPES.OPTION,
        boolean: true,
        name: 'v'
      },
      {
        type: tokenizer.TYPES.WORD,
        name: 'foo'
      },
      {
        type: tokenizer.TYPES.WORD,
        name: 'bar'
      }
    ]
  ]);
});
