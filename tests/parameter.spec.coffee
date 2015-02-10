chai = require('chai')
expect = chai.expect
Parameter = require('../lib/parameter')
settings = require('../lib/settings')

describe 'Parameter:', ->

	describe '#constructor()', ->

		it 'should throw an error if parameter is missing', ->
			expect ->
				new Parameter()
			.to.throw(Error)

		it 'should convert a number parameter to string', ->
			parameter = new Parameter(121)
			expect(parameter.parameter).to.equal('121')

		it 'should throw an error if parameter is not a string or a number', ->
			expect ->
				new Parameter([ 1, 2, 3 ])
			.to.throw(Error)

		it 'should return an error if required variadic and has stdin support', ->
			expect ->
				new Parameter('<|foo...>')
			.to.throw('Parameter can\'t be variadic and allow stdin')

		it 'should return an error if optional variadic and has stdin support', ->
			expect ->
				new Parameter('[|foo...]')
			.to.throw('Parameter can\'t be variadic and allow stdin')

	describe '#isRequired()', ->

		it 'should return true for required parameters', ->
			parameter = new Parameter('<foo>')
			expect(parameter.isRequired()).to.be.true

		it 'should return true for variadic required parameters', ->
			parameter = new Parameter('<foo...>')
			expect(parameter.isRequired()).to.be.true

		it 'should return true for multi word required parameters', ->
			parameter = new Parameter('<foo bar>')
			expect(parameter.isRequired()).to.be.true

		it 'should return false for optional parameters', ->
			parameter = new Parameter('[foo]')
			expect(parameter.isRequired()).to.be.false

		it 'should return false for variadic optional parameters', ->
			parameter = new Parameter('[foo...]')
			expect(parameter.isRequired()).to.be.false

		it 'should return false for invalid parameters', ->
			for input in [
				'foo'
				'<foo]'
				'[foo>'
				''
			]
				parameter = new Parameter(input)
				expect(parameter.isRequired()).to.be.false

	describe '#isOptional()', ->

		it 'should return true for optional parameters', ->
			parameter = new Parameter('[foo]')
			expect(parameter.isOptional()).to.be.true

		it 'should return true for variadic optional parameters', ->
			parameter = new Parameter('[foo...]')
			expect(parameter.isOptional()).to.be.true

		it 'should return true for multi word optional parameters', ->
			parameter = new Parameter('[foo bar]')
			expect(parameter.isOptional()).to.be.true

		it 'should return false for required parameters', ->
			parameter = new Parameter('<foo>')
			expect(parameter.isOptional()).to.be.false

		it 'should return false for variadic required parameters', ->
			parameter = new Parameter('<foo...>')
			expect(parameter.isOptional()).to.be.false

		it 'should return false for invalid parameters', ->
			for input in [
				'foo'
				'<foo]'
				'[foo>'
				''
			]
				parameter = new Parameter(input)
				expect(parameter.isOptional()).to.be.false

	describe '#isVariadic()', ->

		it 'should return true for variadic required parameters', ->
			parameter = new Parameter('<foo...>')
			expect(parameter.isVariadic()).to.be.true

		it 'should return true for variadic optional parameters', ->
			parameter = new Parameter('[foo...]')
			expect(parameter.isVariadic()).to.be.true

		it 'should return true for variadic multi word required parameters', ->
			parameter = new Parameter('<foo bar...>')
			expect(parameter.isVariadic()).to.be.true

		it 'should return true for variadic multi word optional parameters', ->
			parameter = new Parameter('[foo bar...]')
			expect(parameter.isVariadic()).to.be.true

		it 'should return false for required parameters', ->
			parameter = new Parameter('<foo>')
			expect(parameter.isVariadic()).to.be.false

		it 'should return false for optional parameters', ->
			parameter = new Parameter('<foo>')
			expect(parameter.isVariadic()).to.be.false

		it 'should return false for invalid parameters', ->
			for input in [
				'foo'
				'<foo]'
				'[foo>'
				''
				'foo..'
				'<...foo>'
			]
				parameter = new Parameter(input)
				expect(parameter.isVariadic()).to.be.false

	describe '#isWord()', ->

		it 'should return false for required parameters', ->
			parameter = new Parameter('<foo>')
			expect(parameter.isWord()).to.be.false

		it 'should return false for optional parameters', ->
			parameter = new Parameter('[foo]')
			expect(parameter.isWord()).to.be.false

		it 'should return false for multi word required parameters', ->
			parameter = new Parameter('<foo bar>')
			expect(parameter.isWord()).to.be.false

		it 'should return false for multi word optional parameters', ->
			parameter = new Parameter('[foo bar]')
			expect(parameter.isWord()).to.be.false

		it 'should return false for variadic required parameters', ->
			parameter = new Parameter('<foo...>')
			expect(parameter.isWord()).to.be.false

		it 'should return false for variadic optional parameters', ->
			parameter = new Parameter('[foo...]')
			expect(parameter.isWord()).to.be.false

		it 'should return true for everything else', ->
			for input in [
				'foo'
				'foo...'
				'<foo]'
				'[foo>'
				'foo bar'
				''
			]
				parameter = new Parameter(input)
				expect(parameter.isWord()).to.be.true

	describe '#isMultiWord()', ->

		it 'should return true for non parameter multi words', ->
			parameter = new Parameter('foo bar')
			expect(parameter.isMultiWord()).to.be.true

		it 'should return true for required parameter multi words', ->
			parameter = new Parameter('<foo bar>')
			expect(parameter.isMultiWord()).to.be.true

		it 'should return true for optional parameter multi words', ->
			parameter = new Parameter('[foo bar]')
			expect(parameter.isMultiWord()).to.be.true

		it 'should return true for variadic required parameter multi words', ->
			parameter = new Parameter('<foo bar...>')
			expect(parameter.isMultiWord()).to.be.true

		it 'should return true for variadic optional parameter multi words', ->
			parameter = new Parameter('[foo bar...]')
			expect(parameter.isMultiWord()).to.be.true

		it 'should return false for single word non parameters', ->
			parameter = new Parameter('foo')
			expect(parameter.isMultiWord()).to.be.false

		it 'should return false for single word required parameters', ->
			parameter = new Parameter('<foo>')
			expect(parameter.isMultiWord()).to.be.false

		it 'should return false for single word optional parameters', ->
			parameter = new Parameter('[foo]')
			expect(parameter.isMultiWord()).to.be.false

		it 'should return false for single word variadic required parameters', ->
			parameter = new Parameter('<foo...>')
			expect(parameter.isMultiWord()).to.be.false

		it 'should return false for single word variadic optional parameters', ->
			parameter = new Parameter('[foo...]')
			expect(parameter.isMultiWord()).to.be.false

	describe '#allowsStdin()', ->

		it 'should return false for required parameters', ->
			parameter = new Parameter('<foo>')
			expect(parameter.allowsStdin()).to.be.false

		it 'should return false for variadic required parameters', ->
			parameter = new Parameter('<foo...>')
			expect(parameter.allowsStdin()).to.be.false

		it 'should return false for multi word required parameters', ->
			parameter = new Parameter('<foo bar>')
			expect(parameter.allowsStdin()).to.be.false

		it 'should return false for optional parameters', ->
			parameter = new Parameter('[foo]')
			expect(parameter.allowsStdin()).to.be.false

		it 'should return false for variadic optional parameters', ->
			parameter = new Parameter('[foo...]')
			expect(parameter.allowsStdin()).to.be.false

		it 'should return false for invalid parameters', ->
			for input in [
				'foo'
				'<foo]'
				'[foo>'
				''
			]
				parameter = new Parameter(input)
				expect(parameter.allowsStdin()).to.be.false

		it 'should return true if required with |', ->
			parameter = new Parameter('<|foo>')
			expect(parameter.allowsStdin()).to.be.true

		it 'should return true if optional with |', ->
			parameter = new Parameter('[|foo]')
			expect(parameter.allowsStdin()).to.be.true

		it 'should return false if no parameter with |', ->
			parameter = new Parameter('|foo')
			expect(parameter.allowsStdin()).to.be.false

		it 'should return true if multi word required with |', ->
			parameter = new Parameter('<|foo bar>')
			expect(parameter.allowsStdin()).to.be.true

		it 'should return true if multi word optional with |', ->
			parameter = new Parameter('[|foo bar]')
			expect(parameter.allowsStdin()).to.be.true

	describe '#getValue()', ->

		it 'should get word values', ->
			parameter = new Parameter('foo')
			expect(parameter.getValue()).to.equal('foo')

		it 'should get multi word values', ->
			parameter = new Parameter('foo bar')
			expect(parameter.getValue()).to.equal('foo bar')

		it 'should get the value of required parameter', ->
			parameter = new Parameter('<foo>')
			expect(parameter.getValue()).to.equal('foo')

		it 'should get the value of optional parameter', ->
			parameter = new Parameter('[foo]')
			expect(parameter.getValue()).to.equal('foo')

		it 'should get the value of multi word required parameter', ->
			parameter = new Parameter('<foo bar>')
			expect(parameter.getValue()).to.equal('foo bar')

		it 'should get the value of multi word optional parameter', ->
			parameter = new Parameter('[foo bar]')
			expect(parameter.getValue()).to.equal('foo bar')

		it 'should get the value of variadic required parameter', ->
			parameter = new Parameter('<foo...>')
			expect(parameter.getValue()).to.equal('foo')

		it 'should get the value of variadic optional parameter', ->
			parameter = new Parameter('[foo...]')
			expect(parameter.getValue()).to.equal('foo')

		it 'should get the value of stdin optional parameter', ->
			parameter = new Parameter('[|foo]')
			expect(parameter.getValue()).to.equal('foo')

		it 'should get the value of stdin required parameter', ->
			parameter = new Parameter('<|foo>')
			expect(parameter.getValue()).to.equal('foo')

	describe '#getType()', ->

		it 'should return word for word parameters', ->
			parameter = new Parameter('foo')
			expect(parameter.getType()).to.equal('word')

		it 'should return word for multi word parameters', ->
			parameter = new Parameter('foo bar')
			expect(parameter.getType()).to.equal('word')

		it 'should return parameter for required parameters', ->
			parameter = new Parameter('<foo>')
			expect(parameter.getType()).to.equal('parameter')

		it 'should return parameter for optional parameters', ->
			parameter = new Parameter('[foo]')
			expect(parameter.getType()).to.equal('parameter')

		it 'should return parameter for multi word required parameters', ->
			parameter = new Parameter('<foo bar>')
			expect(parameter.getType()).to.equal('parameter')

		it 'should return parameter for multi word optional parameters', ->
			parameter = new Parameter('[foo bar]')
			expect(parameter.getType()).to.equal('parameter')

		it 'should return parameter for variadic required parameters', ->
			parameter = new Parameter('<foo...>')
			expect(parameter.getType()).to.equal('parameter')

		it 'should return parameter for variadic optional parameters', ->
			parameter = new Parameter('[foo...]')
			expect(parameter.getType()).to.equal('parameter')

	describe '#matches()', ->

		describe 'given a word', ->

			beforeEach ->
				@parameter = new Parameter('foo')

			it 'should return false if missing', ->
				expect(@parameter.matches('')).to.be.false
				expect(@parameter.matches()).to.be.false

			it 'should return true if equal to value', ->
				expect(@parameter.matches('foo')).to.be.true

			it 'should return false if not equal to value', ->
				expect(@parameter.matches('bar')).to.be.false

			it 'should return false if it shares root', ->
				expect(@parameter.matches('foo bar')).to.be.false

		describe 'given a required parameter', ->

			beforeEach ->
				@parameter = new Parameter('<foo>')

			it 'should return false if missing', ->
				expect(@parameter.matches('')).to.be.false
				expect(@parameter.matches()).to.be.false

			it 'should return true if it matches', ->
				expect(@parameter.matches('bar')).to.be.true

			it 'should return true if command exceeds', ->
				expect(@parameter.matches('bar baz')).to.be.true

		describe 'given an optional parameter', ->

			beforeEach ->
				@parameter = new Parameter('[foo]')

			it 'should return true if missing', ->
				expect(@parameter.matches('')).to.be.true
				expect(@parameter.matches()).to.be.true

			it 'should return true if it matches', ->
				expect(@parameter.matches('hello')).to.be.true

			it 'should return true if it exceeds', ->
				expect(@parameter.matches('hello world')).to.be.true

		describe 'given a required variadic parameter', ->

			beforeEach ->
				@parameter = new Parameter('<foo...>')

			it 'should return false if missing', ->
				expect(@parameter.matches('')).to.be.false
				expect(@parameter.matches()).to.be.false

			it 'should return true if one word', ->
				expect(@parameter.matches('hello')).to.be.true

			it 'should return true if multi word', ->
				expect(@parameter.matches('hello world')).to.be.true

		describe 'given an optional variadic parameter', ->

			beforeEach ->
				@parameter = new Parameter('[foo...]')

			it 'should return true if missing', ->
				expect(@parameter.matches('')).to.be.true
				expect(@parameter.matches()).to.be.true

			it 'should return true if one word', ->
				expect(@parameter.matches('hello')).to.be.true

			it 'should return true if multi word', ->
				expect(@parameter.matches('hello world')).to.be.true

	describe '#toString()', ->

		it 'should convert a word to string', ->
			parameter = new Parameter('foo')
			expect(parameter.toString()).to.equal('foo')

		it 'should convert a required parameter to string', ->
			parameter = new Parameter('<foo>')
			expect(parameter.toString()).to.equal('<foo>')

		it 'should convert an optional parameter to string', ->
			parameter = new Parameter('[foo]')
			expect(parameter.toString()).to.equal('[foo]')

		it 'should convert a multi word required parameter to string', ->
			parameter = new Parameter('<foo bar>')
			expect(parameter.toString()).to.equal('<foo bar>')

		it 'should convert a multi word optional parameter to string', ->
			parameter = new Parameter('[foo bar]')
			expect(parameter.toString()).to.equal('[foo bar]')

		it 'should convert a required variadic parameter to string', ->
			parameter = new Parameter('<foo...>')
			expect(parameter.toString()).to.equal('<foo...>')

		it 'should convert a optional variadic parameter to string', ->
			parameter = new Parameter('[foo...]')
			expect(parameter.toString()).to.equal('[foo...]')

		it 'should convert a wildcard to string', ->
			parameter = new Parameter(settings.signatures.wildcard)
			expect(parameter.toString()).to.equal(settings.signatures.wildcard)

		it 'should preserve quotes for multi word non parameters', ->
			parameter = new Parameter('foo bar')
			expect(parameter.toString()).to.equal('"foo bar"')
