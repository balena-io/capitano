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
const MODES = require('../../lib/parser/modes');

ava.test('getArgumentType: should return OPTION given a UNIX short option and mode if UNIX', (test) => {
  test.is(tokenizer.getArgumentType('-x', {
    mode: MODES.UNIX
  }), tokenizer.TYPES.OPTION);
});

ava.test('getArgumentType: should return OPTION given a UNIX long option and mode if UNIX', (test) => {
  test.is(tokenizer.getArgumentType('--foo', {
    mode: MODES.UNIX
  }), tokenizer.TYPES.OPTION);
});

ava.test('getArgumentType: should return WORD given a Windows short option and mode if UNIX', (test) => {
  test.is(tokenizer.getArgumentType('/x', {
    mode: MODES.UNIX
  }), tokenizer.TYPES.WORD);
});

ava.test('getArgumentType: should return WORD given a Windows long option and mode if UNIX', (test) => {
  test.is(tokenizer.getArgumentType('/foo', {
    mode: MODES.UNIX
  }), tokenizer.TYPES.WORD);
});

ava.test('getArgumentType: should return WORD given a word and mode if UNIX', (test) => {
  test.is(tokenizer.getArgumentType('foo', {
    mode: MODES.UNIX
  }), tokenizer.TYPES.WORD);
});

ava.test('getArgumentType: should return EOP given --', (test) => {
  test.is(tokenizer.getArgumentType('--', {
    mode: MODES.UNIX
  }), tokenizer.TYPES.EOP);
});

ava.test('tokenize: should tokenize a single boolean UNIX short option', (test) => {
  test.deepEqual(tokenizer.tokenize([ '-x' ], {
    mode: MODES.UNIX
  }), [
    {
      index: 0,
      type: tokenizer.TYPES.OPTION,
      name: 'x'
    }
  ]);
});

ava.test('tokenize: should tokenize a single boolean UNIX long option', (test) => {
  test.deepEqual(tokenizer.tokenize([ '--foo' ], {
    mode: MODES.UNIX
  }), [
    {
      index: 0,
      type: tokenizer.TYPES.OPTION,
      name: 'foo'
    }
  ]);
});

ava.test('tokenize: should tokenize a single boolean multi-word UNIX long option', (test) => {
  test.deepEqual(tokenizer.tokenize([ '--foo-bar-baz' ], {
    mode: MODES.UNIX
  }), [
    {
      index: 0,
      type: tokenizer.TYPES.OPTION,
      name: 'foo-bar-baz'
    }
  ]);
});

ava.test('tokenize: should tokenize a complex set of UNIX arguments', (test) => {
  test.deepEqual(tokenizer.tokenize([ 'flash', '-c', '--drive', '/dev/disk2', '-y' ], {
    mode: MODES.UNIX
  }), [
    {
      index: 0,
      type: tokenizer.TYPES.WORD,
      name: 'flash'
    },
    {
      index: 1,
      type: tokenizer.TYPES.OPTION,
      name: 'c'
    },
    {
      index: 2,
      type: tokenizer.TYPES.OPTION,
      name: 'drive'
    },
    {
      index: 3,
      type: tokenizer.TYPES.WORD,
      name: '/dev/disk2'
    },
    {
      index: 4,
      type: tokenizer.TYPES.OPTION,
      name: 'y'
    }
  ]);
});

ava.test('tokenize: should tokenize Windows options as WORDs', (test) => {
  test.deepEqual(tokenizer.tokenize([ '/x', '/foo' ], {
    mode: MODES.UNIX
  }), [
    {
      index: 0,
      type: tokenizer.TYPES.WORD,
      name: '/x'
    },
    {
      index: 1,
      type: tokenizer.TYPES.WORD,
      name: '/foo'
    }
  ]);
});

ava.test('should interpret everything as WORD if -- is encountered', (test) => {
  test.deepEqual(tokenizer.tokenize([ 'flash', '-c', '--', '--drive', '/dev/disk2', '-y' ], {
    mode: MODES.UNIX
  }), [
    {
      index: 0,
      type: tokenizer.TYPES.WORD,
      name: 'flash'
    },
    {
      index: 1,
      type: tokenizer.TYPES.OPTION,
      name: 'c'
    },
    {
      index: 2,
      type: tokenizer.TYPES.WORD,
      name: '--drive'
    },
    {
      index: 3,
      type: tokenizer.TYPES.WORD,
      name: '/dev/disk2'
    },
    {
      index: 4,
      type: tokenizer.TYPES.WORD,
      name: '-y'
    }
  ]);
});
