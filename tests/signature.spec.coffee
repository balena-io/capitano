_ = require('lodash')
chai = require('chai')
expect = chai.expect
Signature = require('../lib/signature')
Parameter = require('../lib/parameter')
settings = require('../lib/settings')

describe 'Signature:', ->

	describe '#constructor()', ->

		it 'should throw an error if no signature', ->
			expect ->
				new Signature()
			.to.throw(Error)

		it 'should throw an error if signature is not a string', ->
			expect ->
				new Signature([ 1, 2, 3 ])
			.to.throw(Error)

		it 'should store each parameter', ->
			signature = new Signature('foo bar baz')
			expect(signature.parameters).to.have.length(3)

		it 'should store each parameter as instance of Parameter', ->
			signature = new Signature('foo bar baz')
			for parameter in signature.parameters
				expect(parameter).to.be.an.instanceof(Parameter)

		it 'should throw an error if the variadic parameter is not the last one', ->
			expect ->
				new Signature('foo <bar...> <baz>')
			.to.throw(Error)

		it 'should throw an error if there are multiple variadic parameters', ->
			expect ->
				new Signature('foo <bar...> <baz...>')
			.to.throw(Error)

	describe '#_addParameter()', ->

		it 'should add the parameter to the class', ->
			signature = new Signature('foo')
			expect(signature.parameters).to.have.length(1)
			signature._addParameter('<bar>')
			expect(signature.parameters).to.have.length(2)
			lastParameter = _.last(signature.parameters)

			expect(lastParameter.getValue()).to.equal('bar')
			expect(lastParameter.getType()).to.equal('parameter')
			expect(lastParameter.isRequired()).to.equal(true)
			expect(lastParameter.isVariadic()).to.equal(false)

	describe '#hasParameters()', ->

		it 'should return false if no parameters', ->
			signature = new Signature('foo')
			expect(signature.hasParameters()).to.be.false

		it 'should return true if required parameters', ->
			signature = new Signature('foo <bar>')
			expect(signature.hasParameters()).to.be.true

		it 'should return true if optional parameters', ->
			signature = new Signature('foo [bar]')
			expect(signature.hasParameters()).to.be.true

		it 'should return true if multiple required parameters', ->
			signature = new Signature('foo <bar> <baz>')
			expect(signature.hasParameters()).to.be.true

		it 'should return true if optional parameters', ->
			signature = new Signature('foo [bar] [baz]')
			expect(signature.hasParameters()).to.be.true

		it 'should return true if variadic required parameters', ->
			signature = new Signature('foo <bar...>')
			expect(signature.hasParameters()).to.be.true

		it 'should return true variadic parameters', ->
			signature = new Signature('foo [bar...]')
			expect(signature.hasParameters()).to.be.true

	describe '#hasVariadicParameters', ->

		it 'should return false if no parameters', ->
			signature = new Signature('foo')
			expect(signature.hasVariadicParameters()).to.be.false

		it 'should return false if required parameters', ->
			signature = new Signature('foo <bar>')
			expect(signature.hasVariadicParameters()).to.be.false

		it 'should return false if optional parameters', ->
			signature = new Signature('foo [bar]')
			expect(signature.hasVariadicParameters()).to.be.false

		it 'should return false if multiple required parameters', ->
			signature = new Signature('foo <bar> <baz>')
			expect(signature.hasVariadicParameters()).to.be.false

		it 'should return false if optional parameters', ->
			signature = new Signature('foo [bar] [baz]')
			expect(signature.hasVariadicParameters()).to.be.false

		it 'should return true if variadic required parameters', ->
			signature = new Signature('foo <bar...>')
			expect(signature.hasVariadicParameters()).to.be.true

		it 'should return true variadic parameters', ->
			signature = new Signature('foo [bar...]')
			expect(signature.hasVariadicParameters()).to.be.true

	describe '#toString()', ->

		it 'should convert a signature to string', ->
			signature = new Signature('foo <bar> [baz...]')
			expect(signature.toString()).to.equal('foo <bar> [baz...]')

		it 'should convert a wildcard to string', ->
			signature = new Signature('*')
			expect(signature.toString()).to.equal('*')

	describe '#isWildcard()', ->

		it 'should return true if it is wildcard', ->
			signature = new Signature(settings.signatures.wildcard)
			expect(signature.isWildcard()).to.be.true

		it 'should return false if it is not wildcard', ->
			signature = new Signature('foo <bar>')
			expect(signature.isWildcard()).to.be.false

		it 'should return false if it starts with a wildcard', ->
			signature = new Signature("#{settings.signatures.wildcard} foo")
			expect(signature.isWildcard()).to.be.false

	describe '#matches()', ->

		it 'should match agains a wildcard', ->
			signature = new Signature('*')
			result = signature.matches('foo hello')
			expect(result).to.be.true

		describe 'given one word signatures', ->

			it 'should return true if matches', ->
				signature = new Signature('foo <bar>')
				result = signature.matches('foo hello')
				expect(result).to.be.true

			it 'should return true if optional parameter is missing', ->
				signature = new Signature('foo [bar]')
				result = signature.matches('foo')
				expect(result).to.be.true

			it 'should return true if required parameter is missing', ->
				signature = new Signature('foo <bar>')
				result = signature.matches('foo')
				expect(result).to.be.true

			it 'should return false if no match', ->
				signature = new Signature('foo <hello>')
				result = signature.matches('bar hello')
				expect(result).to.be.false

			it 'should return false if signature exceeds command', ->
				signature = new Signature('app <id>')
				result = signature.matches('app rm 91')
				expect(result).to.be.false

		describe 'given multi word signatures', ->

			it 'should return true if matches', ->
				signature = new Signature('foo bar <bar>')
				result = signature.matches('foo bar hello')
				expect(result).to.be.true

		describe 'given variadic signatures', ->

			it 'should return true if matches', ->
				signature = new Signature('foo bar <bar...>')
				result = signature.matches('foo bar hello world baz')
				expect(result).to.be.true

			it 'should return true if missing optional variadic parameter', ->
				signature = new Signature('foo bar [bar...]')
				result = signature.matches('foo bar')
				expect(result).to.be.true

			it 'should return true if missing required variadic parameter', ->
				signature = new Signature('foo bar <bar...>')
				result = signature.matches('foo bar')
				expect(result).to.be.true

	describe '#compileParameters()', ->

		describe 'given a wildcard', ->

			beforeEach ->
				@signature = new Signature(settings.signatures.wildcard)

			it 'should return an empty object', ->
				result = @signature.compileParameters('foo')
				expect(result).to.deep.equal({})

		describe 'given a signature with no parameters', ->

			beforeEach ->
				@signature = new Signature('foo')

			it 'should return an empty object if it matches', ->
				result = @signature.compileParameters('foo')
				expect(result).to.deep.equal({})

		describe 'given a signature with one required parameter', ->

			beforeEach ->
				@signature = new Signature('foo <bar>')

			it 'should throw an error if prefix is different', ->
				expect =>
					@signature.compileParameters('bar hello')
				.to.throw(Error)

			it 'should throw an error if command exceeds', ->
				expect =>
					@signature.compileParameters('foo hello world')
				.to.throw(Error)

			it 'should throw an error if command misses parameter', ->
				expect =>
					@signature.compileParameters('foo')
				.to.throw('Missing bar')

			it 'should return a single parameter if it matches', ->
				result = @signature.compileParameters('foo hello')
				expect(result).to.deep.equal
					bar: 'hello'

		describe 'given a signature with one optional parameter', ->

			beforeEach ->
				@signature = new Signature('foo [bar]')

			it 'should throw an error if prefix is different', ->
				expect =>
					@signature.compileParameters('bar hello')
				.to.throw(Error)

			it 'should throw an error if command exceeds', ->
				expect =>
					@signature.compileParameters('foo hello world')
				.to.throw(Error)

			it 'should return an empty object if command misses parameter', ->
				result = @signature.compileParameters('foo')
				expect(result).to.deep.equal({})

			it 'should return a single parameter if it matches', ->
				result = @signature.compileParameters('foo hello')
				expect(result).to.deep.equal
					bar: 'hello'

		describe 'given a signature with multiple required parameters', ->

			beforeEach ->
				@signature = new Signature('foo <bar> <baz>')

			it 'should throw an error if prefix is different', ->
				expect =>
					@signature.compileParameters('bar hello world')
				.to.throw(Error)

			it 'should throw an error if command exceeds', ->
				expect =>
					@signature.compileParameters('foo hello world bar')
				.to.throw(Error)

			it 'should throw an error if command misses one parameter', ->
				expect =>
					@signature.compileParameters('foo hello')
				.to.throw('Missing baz')

			it 'should throw an error if command misses both parameters', ->
				expect =>
					@signature.compileParameters('foo')
				.to.throw('Missing bar')

			it 'should return both parameters if it matches', ->
				result = @signature.compileParameters('foo hello world')
				expect(result).to.deep.equal
					bar: 'hello'
					baz: 'world'

		describe 'given a signature with mixed parameters', ->

			beforeEach ->
				@signature = new Signature('foo <bar> [baz]')

			it 'should throw an error if prefix is different', ->
				expect =>
					@signature.compileParameters('bar hello world')
				.to.throw(Error)

			it 'should throw an error if command exceeds', ->
				expect =>
					@signature.compileParameters('foo hello world bar')
				.to.throw(Error)

			it 'should return one parameter if command misses one parameter', ->
				result = @signature.compileParameters('foo hello')
				expect(result).to.deep.equal
					bar: 'hello'

			it 'should throw an error if command misses both parameters', ->
				expect =>
					@signature.compileParameters('foo')
				.to.throw('Missing bar')

			it 'should return both parameters if it matches', ->
				result = @signature.compileParameters('foo hello world')
				expect(result).to.deep.equal
					bar: 'hello'
					baz: 'world'

		describe 'given a signature with a variadic required parameter', ->

			beforeEach ->
				@signature = new Signature('foo <bar...>')

			it 'should throw an error if prefix is different', ->
				expect =>
					@signature.compileParameters('bar hello world')
				.to.throw(Error)

			it 'should all parameters together if command exceeds', ->
				result = @signature.compileParameters('foo hello world bar')
				expect(result).to.deep.equal
					bar: 'hello world bar'

			it 'should throw an error if command misses the parameter', ->
				expect =>
					@signature.compileParameters('foo')
				.to.throw('Missing bar')

			it 'should return all parameters together if it matches', ->
				result = @signature.compileParameters('foo hello world')
				expect(result).to.deep.equal
					bar: 'hello world'

		describe 'given a signature with a variadic optional parameter', ->

			beforeEach ->
				@signature = new Signature('foo [bar...]')

			it 'should throw an error if prefix is different', ->
				expect =>
					@signature.compileParameters('bar hello world')
				.to.throw(Error)

			it 'should all parameters together if command exceeds', ->
				result = @signature.compileParameters('foo hello world bar')
				expect(result).to.deep.equal
					bar: 'hello world bar'

			it 'should return an empty object if command misses the parameter', ->
				result = @signature.compileParameters('foo')
				expect(result).to.deep.equal({})

			it 'should return all parameters together if it matches', ->
				result = @signature.compileParameters('foo hello world')
				expect(result).to.deep.equal
					bar: 'hello world'

		describe 'given number commands', ->

			it 'should parse the numbers automatically', ->
				signature = new Signature('foo <bar>')
				result = signature.compileParameters('foo 19')
				expect(result).to.deep.equal
					bar: 19

		describe 'given path commands', ->

			it 'should be able to parse absolute paths', ->
				signature = new Signature('foo <bar>')
				result = signature.compileParameters('foo /Users/me/foo/bar')
				expect(result).to.deep.equal
					bar: '/Users/me/foo/bar'

			it 'should be able to parse relative paths', ->
				signature = new Signature('foo <bar>')
				result = signature.compileParameters('foo ../hello/world')
				expect(result).to.deep.equal
					bar: '../hello/world'

			it 'should be able to parse home relative paths', ->
				signature = new Signature('foo <bar>')
				result = signature.compileParameters('foo ~/.ssh/id_rsa.pub')
				expect(result).to.deep.equal
					bar: '~/.ssh/id_rsa.pub'

		describe 'given quoted multi word command words', ->

			it 'should parse single quoted multi words correctly', ->
				signature = new Signature('foo <bar>')
				result = signature.compileParameters('foo \'hello world\'')
				expect(result).to.deep.equal
					bar: 'hello world'

			it 'should parse double quoted multi words correctly', ->
				signature = new Signature('foo <bar>')
				result = signature.compileParameters('foo "hello world"')
				expect(result).to.deep.equal
					bar: 'hello world'
