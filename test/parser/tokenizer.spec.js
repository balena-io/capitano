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
const tokenizer = require('../../lib/parser/tokenizer');
const MODES = require('../../lib/parser/modes');

ava.test('TYPES: should be a plain object', (test) => {
  test.true(_.isPlainObject(tokenizer.TYPES));
});

ava.test('TYPES: should contain string values', (test) => {
  test.true(_.every(_.values(tokenizer.TYPES), _.isString));
});

ava.test('TYPES: should contain unique values', (test) => {
  test.not(_.size(_.uniq(_.values(tokenizer.TYPES))), 1);
});

ava.test('getNextToken: should get the next token in an ordered set of tokens', (test) => {
  const tokens = tokenizer.tokenize([ 'foo', 'bar', 'baz' ], {
    mode: MODES.UNIX
  });

  test.is(tokenizer.getNextToken(tokens, 1).name, 'baz');
});

ava.test('getNextToken: should get the next token in an unordered set of tokens', (test) => {
  const tokens = _.shuffle(tokenizer.tokenize([ 'foo', 'bar', 'baz' ], {
    mode: MODES.UNIX
  }));

  test.is(tokenizer.getNextToken(tokens, 1).name, 'baz');
});

ava.test('getNextToken: should return null if there is not a next token', (test) => {
  const tokens = tokenizer.tokenize([ 'foo', 'bar', 'baz' ], {
    mode: MODES.UNIX
  });

  test.is(tokenizer.getNextToken(tokens, 3), null);
});

ava.test('getPreviousToken: should get the previous token in an ordered set of tokens', (test) => {
  const tokens = tokenizer.tokenize([ 'foo', 'bar', 'baz' ], {
    mode: MODES.UNIX
  });

  test.is(tokenizer.getPreviousToken(tokens, 1).name, 'foo');
});

ava.test('getPreviousToken: should get the previous token in an unordered set of tokens', (test) => {
  const tokens = _.shuffle(tokenizer.tokenize([ 'foo', 'bar', 'baz' ], {
    mode: MODES.UNIX
  }));

  test.is(tokenizer.getPreviousToken(tokens, 1).name, 'foo');
});

ava.test('getPreviousToken: should return null if there is not a previous token', (test) => {
  const tokens = tokenizer.tokenize([ 'foo', 'bar', 'baz' ], {
    mode: MODES.UNIX
  });

  test.is(tokenizer.getPreviousToken(tokens, 0), null);
});

ava.test('isOption: should return true if token is a short option', (test) => {
  const token = _.first(tokenizer.tokenize([ '-f' ], {
    mode: MODES.UNIX
  }));

  test.true(tokenizer.isOption(token));
});

ava.test('isOption: should return true if token is a long option', (test) => {
  const token = _.first(tokenizer.tokenize([ '--foo' ], {
    mode: MODES.UNIX
  }));

  test.true(tokenizer.isOption(token));
});

ava.test('isOption: should return false if token is a word', (test) => {
  const token = _.first(tokenizer.tokenize([ 'foo' ], {
    mode: MODES.UNIX
  }));

  test.false(tokenizer.isOption(token));
});

ava.test('isWord: should return false if token is a short option', (test) => {
  const token = _.first(tokenizer.tokenize([ '-f' ], {
    mode: MODES.UNIX
  }));

  test.false(tokenizer.isWord(token));
});

ava.test('isWord: should return false if token is a long option', (test) => {
  const token = _.first(tokenizer.tokenize([ '--foo' ], {
    mode: MODES.UNIX
  }));

  test.false(tokenizer.isWord(token));
});

ava.test('isWord: should return true if token is a word', (test) => {
  const token = _.first(tokenizer.tokenize([ 'foo' ], {
    mode: MODES.UNIX
  }));

  test.true(tokenizer.isWord(token));
});

ava.test('getName: should return the name of a word', (test) => {
  const token = _.first(tokenizer.tokenize([ 'foo' ], {
    mode: MODES.UNIX
  }));

  test.is(tokenizer.getName(token), 'foo');
});

ava.test('getName: should return the name of a short option', (test) => {
  const token = _.first(tokenizer.tokenize([ '-x' ], {
    mode: MODES.UNIX
  }));

  test.is(tokenizer.getName(token), 'x');
});

ava.test('getName: should return the name of a long option', (test) => {
  const token = _.first(tokenizer.tokenize([ '--foo' ], {
    mode: MODES.UNIX
  }));

  test.is(tokenizer.getName(token), 'foo');
});
