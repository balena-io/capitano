sinon = require('sinon')
_ = require('lodash')
chai = require('chai')
chai.use(require('sinon-chai'))
expect = chai.expect
Signature = require('../lib/signature')
Parameter = require('../lib/parameter')
settings = require('../lib/settings')
utils = require('../lib/utils')

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

		it 'should throw an error if there are multiple stdin parameters', ->
			expect ->
				new Signature('foo <|bar> [|baz]')
			.to.throw('Signature can only contain one stdin parameter')

		it 'should throw an error if the stdin parameter is not the last one', ->
			expect ->
				new Signature('foo <|bar> <baz>')
			.to.throw('The stdin parameter should be the last one')

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

	describe '#allowsStdin()', ->

		it 'should return false if no parameters', ->
			signature = new Signature('foo')
			expect(signature.allowsStdin()).to.be.false

		it 'should return false if no stdin parameter', ->
			signature = new Signature('foo <bar>')
			expect(signature.allowsStdin()).to.be.false

		it 'should return false if required variadic parameter', ->
			signature = new Signature('foo <bar...>')
			expect(signature.allowsStdin()).to.be.false

		it 'should return false if optional variadic parameter', ->
			signature = new Signature('foo [bar...]')
			expect(signature.allowsStdin()).to.be.false

		it 'should return true if one optional stdin parameter', ->
			signature = new Signature('foo [|bar]')
			expect(signature.allowsStdin()).to.be.true

		it 'should return true if one required stdin parameter', ->
			signature = new Signature('foo <|bar>')
			expect(signature.allowsStdin()).to.be.true

		it 'should return true if one non stdin parameter and one stdin parameter', ->
			signature = new Signature('foo <bar> <|baz>')
			expect(signature.allowsStdin()).to.be.true

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

		it 'should match agains a wildcard', (done) ->
			signature = new Signature('*')
			signature.matches 'foo hello', (result) ->
				expect(result).to.be.true
				done()

		describe 'given one word signatures', ->

			it 'should return true if matches', (done) ->
				signature = new Signature('foo <bar>')
				signature.matches 'foo hello', (result) ->
					expect(result).to.be.true
					done()

			it 'should return true if optional parameter is missing', (done) ->
				signature = new Signature('foo [bar]')
				signature.matches 'foo', (result) ->
					expect(result).to.be.true
					done()

			it 'should return true if required parameter is missing', (done) ->
				signature = new Signature('foo <bar>')
				signature.matches 'foo', (result) ->
					expect(result).to.be.true
					done()

			it 'should return false if no match', (done) ->
				signature = new Signature('foo <hello>')
				signature.matches 'bar hello', (result) ->
					expect(result).to.be.false
					done()

			it 'should return false if signature exceeds command', (done) ->
				signature = new Signature('app <id>')
				signature.matches 'app rm 91', (result) ->
					expect(result).to.be.false
					done()

		describe 'given multi word signatures', ->

			it 'should return true if matches', (done) ->
				signature = new Signature('foo bar <bar>')
				signature.matches 'foo bar hello', (result) ->
					expect(result).to.be.true
					done()

		describe 'given variadic signatures', ->

			it 'should return true if matches', (done) ->
				signature = new Signature('foo bar <bar...>')
				signature.matches 'foo bar hello world baz', (result) ->
					expect(result).to.be.true
					done()

			it 'should return true if missing optional variadic parameter', (done) ->
				signature = new Signature('foo bar [bar...]')
				signature.matches 'foo bar', (result) ->
					expect(result).to.be.true
					done()

			it 'should return true if missing required variadic parameter', (done) ->
				signature = new Signature('foo bar <bar...>')
				signature.matches 'foo bar', (result) ->
					expect(result).to.be.true
					done()

	describe '#compileParameters()', ->

		describe 'given a wildcard', ->

			beforeEach ->
				@signature = new Signature(settings.signatures.wildcard)

			it 'should return an empty object', (done) ->
				@signature.compileParameters 'foo', (error, result) ->
					expect(error).to.not.exist
					expect(result).to.deep.equal({})
					done()

		describe 'given a signature with no parameters', ->

			beforeEach ->
				@signature = new Signature('foo')

			it 'should return an empty object if it matches', (done) ->
				@signature.compileParameters 'foo', (error, result) ->
					expect(error).to.not.exist
					expect(result).to.deep.equal({})
					done()

		describe 'given a signature with one required parameter', ->

			beforeEach ->
				@signature = new Signature('foo <bar>')

			it 'should throw an error if prefix is different', (done) ->
				@signature.compileParameters 'bar hello', (error, result) ->
					expect(error).to.be.an.instanceof(Error)
					expect(result).to.not.exist
					done()

			it 'should throw an error if command exceeds', (done) ->
				@signature.compileParameters 'foo hello world', (error, result) ->
					expect(error).to.be.an.instanceof(Error)
					expect(result).to.not.exist
					done()

			it 'should throw an error if command misses parameter', (done) ->
				@signature.compileParameters 'foo', (error, result) ->
					expect(error).to.be.an.instanceof(Error)
					expect(error.message).to.equal('Missing bar')
					expect(result).to.not.exist
					done()

			it 'should return a single parameter if it matches', (done) ->
				@signature.compileParameters 'foo hello', (error, result) ->
					expect(error).to.not.exist
					expect(result).to.deep.equal
						bar: 'hello'
					done()

		describe 'given a signature with one optional parameter', ->

			beforeEach ->
				@signature = new Signature('foo [bar]')

			it 'should throw an error if prefix is different', (done) ->
				@signature.compileParameters 'bar hello', (error, result) ->
					expect(error).to.be.an.instanceof(Error)
					expect(result).to.not.exist
					done()

			it 'should throw an error if command exceeds', (done) ->
				@signature.compileParameters 'foo hello world', (error, result) ->
					expect(error).to.be.an.instanceof(Error)
					expect(result).to.not.exist
					done()

			it 'should return an empty object if command misses parameter', (done) ->
				@signature.compileParameters 'foo', (error, result) ->
					expect(error).to.not.exist
					expect(result).to.deep.equal({})
					done()

			it 'should return a single parameter if it matches', (done) ->
				@signature.compileParameters 'foo hello', (error, result) ->
					expect(error).to.not.exist
					expect(result).to.deep.equal
						bar: 'hello'
					done()

		describe 'given a command with a stdin required parameter', ->

			beforeEach ->
				@signature = new Signature('foo <|bar>')

			describe 'if performStdin flag is false', ->

				beforeEach ->
					@utilsGetStdinStub = sinon.stub(utils, 'getStdin')

				afterEach ->
					@utilsGetStdinStub.restore()

				it 'should not call getStdin', (done) ->
					@signature.compileParameters 'foo', (error, result) =>
						expect(@utilsGetStdinStub).to.not.have.been.called
						done()
					, false

			describe 'if performStdin flag is true', ->

				beforeEach ->
					@utilsGetStdinStub = sinon.stub(utils, 'getStdin')
					@utilsGetStdinStub.callsArgWithAsync(0, 'Hello World')

				afterEach ->
					@utilsGetStdinStub.restore()

				it 'should call getStdin', (done) ->
					@signature.compileParameters 'foo', (error, result) =>
						expect(@utilsGetStdinStub).to.have.been.calledOnce
						done()
					, true

			describe 'if performStdin flag is undefined', ->

				beforeEach ->
					@utilsGetStdinStub = sinon.stub(utils, 'getStdin')
					@utilsGetStdinStub.callsArgWithAsync(0, 'Hello World')

				afterEach ->
					@utilsGetStdinStub.restore()

				it 'should call getStdin', (done) ->
					@signature.compileParameters 'foo', (error, result) =>
						expect(@utilsGetStdinStub).to.have.been.calledOnce
						done()

			describe 'if stdin returns data', ->

				beforeEach ->
					@utilsGetStdinStub = sinon.stub(utils, 'getStdin')
					@utilsGetStdinStub.callsArgWithAsync(0, 'Hello World')

				afterEach ->
					@utilsGetStdinStub.restore()

				it 'should assign the parameter to the stdin output', (done) ->
					@signature.compileParameters 'foo', (error, result) ->
						expect(error).to.not.exist
						expect(result).to.deep.equal
							bar: 'Hello World'
						done()

			describe 'if stdin does not return data', ->

				beforeEach ->
					@utilsGetStdinStub = sinon.stub(utils, 'getStdin')
					@utilsGetStdinStub.callsArgWithAsync(0, undefined)

				afterEach ->
					@utilsGetStdinStub.restore()

				it 'should throw an error', (done) ->
					@signature.compileParameters 'foo', (error, result) ->
						expect(error).to.be.an.instanceof(Error)
						expect(error.message).to.equal('Missing bar')
						expect(result).to.not.exist
						done()

		describe 'given a command with a stdin optional parameter', ->

			beforeEach ->
				@signature = new Signature('foo [|bar]')

			describe 'if stdin returns data', ->

				beforeEach ->
					@utilsGetStdinStub = sinon.stub(utils, 'getStdin')
					@utilsGetStdinStub.callsArgWithAsync(0, 'Hello World')

				afterEach ->
					@utilsGetStdinStub.restore()

				it 'should assign the parameter to the stdin output', (done) ->
					@signature.compileParameters 'foo', (error, result) ->
						expect(error).to.not.exist
						expect(result).to.deep.equal
							bar: 'Hello World'
						done()

			describe 'if stdin does not return data', ->

				beforeEach ->
					@utilsGetStdinStub = sinon.stub(utils, 'getStdin')
					@utilsGetStdinStub.callsArgWithAsync(0, undefined)

				afterEach ->
					@utilsGetStdinStub.restore()

				it 'should do nothing', (done) ->
					@signature.compileParameters 'foo', (error, result) ->
						expect(error).to.not.exist
						expect(result).to.deep.equal({})
						done()

		describe 'given a signature with a required parameter and a required stdin parameter', ->

			beforeEach ->
				@signature = new Signature('foo <bar> <|baz>')

			describe 'if stdin returns data', ->

				beforeEach ->
					@utilsGetStdinStub = sinon.stub(utils, 'getStdin')
					@utilsGetStdinStub.callsArgWithAsync(0, 'Hello World')

				afterEach ->
					@utilsGetStdinStub.restore()

				it 'should assign the parameter to the stdin output', (done) ->
					@signature.compileParameters 'foo hello', (error, result) ->
						expect(error).to.not.exist
						expect(result).to.deep.equal
							bar: 'hello'
							baz: 'Hello World'
						done()

			describe 'if stdin does not return data', ->

				beforeEach ->
					@utilsGetStdinStub = sinon.stub(utils, 'getStdin')
					@utilsGetStdinStub.callsArgWithAsync(0, undefined)

				afterEach ->
					@utilsGetStdinStub.restore()

				it 'should throw an error', (done) ->
					@signature.compileParameters 'foo hello', (error, result) ->
						expect(error).to.be.an.instanceof(Error)
						expect(error.message).to.equal('Missing baz')
						expect(result).to.not.exist
						done()

		describe 'given a signature with a required parameter and an optional stdin parameter', ->

			beforeEach ->
				@signature = new Signature('foo <bar> [|baz]')

			describe 'if stdin returns data', ->

				beforeEach ->
					@utilsGetStdinStub = sinon.stub(utils, 'getStdin')
					@utilsGetStdinStub.callsArgWithAsync(0, 'Hello World')

				afterEach ->
					@utilsGetStdinStub.restore()

				it 'should assign the parameter to the stdin output', (done) ->
					@signature.compileParameters 'foo hello', (error, result) ->
						expect(error).to.not.exist
						expect(result).to.deep.equal
							bar: 'hello'
							baz: 'Hello World'
						done()

			describe 'if stdin does not return data', ->

				beforeEach ->
					@utilsGetStdinStub = sinon.stub(utils, 'getStdin')
					@utilsGetStdinStub.callsArgWithAsync(0, undefined)

				afterEach ->
					@utilsGetStdinStub.restore()

				it 'should do nothing', (done) ->
					@signature.compileParameters 'foo hello', (error, result) ->
						expect(error).to.not.exist
						expect(result).to.deep.equal
							bar: 'hello'
						done()

		describe 'given a signature with multiple required parameters', ->

			beforeEach ->
				@signature = new Signature('foo <bar> <baz>')

			it 'should throw an error if prefix is different', (done) ->
				@signature.compileParameters 'bar hello world', (error, result) ->
					expect(error).to.be.an.instanceof(Error)
					expect(result).to.not.exist
					done()

			it 'should throw an error if command exceeds', (done) ->
				@signature.compileParameters 'foo hello world bar', (error, result) ->
					expect(error).to.be.an.instanceof(Error)
					expect(result).to.not.exist
					done()

			it 'should throw an error if command misses one parameter', (done) ->
				@signature.compileParameters 'foo hello', (error, result) ->
					expect(error).to.be.an.instanceof(Error)
					expect(error.message).to.equal('Missing baz')
					expect(result).to.not.exist
					done()

			it 'should throw an error if command misses both parameters', (done) ->
				@signature.compileParameters 'foo', (error, result) ->
					expect(error).to.be.an.instanceof(Error)
					expect(error.message).to.equal('Missing bar')
					expect(result).to.not.exist
					done()

			it 'should return both parameters if it matches', (done) ->
				@signature.compileParameters 'foo hello world', (error, result) ->
					expect(error).to.not.exist
					expect(result).to.deep.equal
						bar: 'hello'
						baz: 'world'
					done()

		describe 'given a signature with mixed parameters', ->

			beforeEach ->
				@signature = new Signature('foo <bar> [baz]')

			it 'should throw an error if prefix is different', (done) ->
				@signature.compileParameters 'bar hello world', (error, result) ->
					expect(error).to.be.an.instanceof(Error)
					expect(result).to.not.exist
					done()

			it 'should throw an error if command exceeds', (done) ->
				@signature.compileParameters 'foo hello world bar', (error, result) ->
					expect(error).to.be.an.instanceof(Error)
					expect(result).to.not.exist
					done()

			it 'should return one parameter if command misses one parameter', (done) ->
				@signature.compileParameters 'foo hello', (error, result) ->
					expect(error).to.not.exist
					expect(result).to.deep.equal
						bar: 'hello'
					done()

			it 'should throw an error if command misses both parameters', (done) ->
				@signature.compileParameters 'foo', (error, result) ->
					expect(error).to.be.an.instanceof(Error)
					expect(error.message).to.equal('Missing bar')
					expect(result).to.not.exist
					done()

			it 'should return both parameters if it matches', (done) ->
				@signature.compileParameters 'foo hello world', (error, result)  ->
					expect(error).to.not.exist
					expect(result).to.deep.equal
						bar: 'hello'
						baz: 'world'
					done()

		describe 'given a signature with a variadic required parameter', ->

			beforeEach ->
				@signature = new Signature('foo <bar...>')

			it 'should throw an error if prefix is different', (done) ->
				@signature.compileParameters 'bar hello world', (error, result) ->
					expect(error).to.be.an.instanceof(Error)
					expect(result).to.not.exist
					done()

			it 'should all parameters together if command exceeds', (done) ->
				@signature.compileParameters 'foo hello world bar', (error, result) ->
					expect(error).to.not.exist
					expect(result).to.deep.equal
						bar: 'hello world bar'
					done()

			it 'should throw an error if command misses the parameter', (done) ->
				@signature.compileParameters 'foo', (error, result) ->
					expect(error).to.be.an.instanceof(Error)
					expect(error.message).to.equal('Missing bar')
					expect(result).to.not.exist
					done()

			it 'should return all parameters together if it matches', (done) ->
				@signature.compileParameters 'foo hello world', (error, result)  ->
					expect(error).to.not.exist
					expect(result).to.deep.equal
						bar: 'hello world'
					done()

		describe 'given a multi-word signature with a variadic required parameter', ->

			beforeEach ->
				@signature = new Signature('foo bar <baz...>')

			it 'should throw an error if prefix is different', (done) ->
				@signature.compileParameters 'foo baz hello world', (error, result) ->
					expect(error).to.be.an.instanceof(Error)
					expect(result).to.not.exist
					done()

			it 'should all parameters together if command exceeds', (done) ->
				@signature.compileParameters 'foo bar hello world', (error, result) ->
					expect(error).to.not.exist
					expect(result).to.deep.equal
						baz: 'hello world'
					done()

			it 'should throw an error if command misses the parameter', (done) ->
				@signature.compileParameters 'foo bar', (error, result) ->
					expect(error).to.be.an.instanceof(Error)
					expect(error.message).to.equal('Missing baz')
					expect(result).to.not.exist
					done()

		describe 'given a signature with a variadic optional parameter', ->

			beforeEach ->
				@signature = new Signature('foo [bar...]')

			it 'should throw an error if prefix is different', (done) ->
				@signature.compileParameters 'bar hello world', (error, result) ->
					expect(error).to.be.an.instanceof(Error)
					expect(result).to.not.exist
					done()

			it 'should all parameters together if command exceeds', (done) ->
				@signature.compileParameters 'foo hello world bar', (error, result) ->
					expect(error).to.not.exist
					expect(result).to.deep.equal
						bar: 'hello world bar'
					done()

			it 'should return an empty object if command misses the parameter', (done) ->
				@signature.compileParameters 'foo', (error, result) ->
					expect(error).to.not.exist
					expect(result).to.deep.equal({})
					done()

			it 'should return all parameters together if it matches', (done) ->
				@signature.compileParameters 'foo hello world', (error, result) ->
					expect(error).to.not.exist
					expect(result).to.deep.equal
						bar: 'hello world'
					done()

		describe 'given number commands', ->

			it 'should parse the numbers automatically', (done) ->
				signature = new Signature('foo <bar>')
				signature.compileParameters 'foo 19', (error, result) ->
					expect(error).to.not.exist
					expect(result).to.deep.equal
						bar: 19
					done()

			it 'should match with a string that starts with a number', (done) ->
				signature = new Signature('<foo>')
				signature.compileParameters '1bar', (error, result) ->
					expect(error).to.not.exist
					expect(result).to.deep.equal(foo: '1bar')
					done()

		describe 'given path commands', ->

			it 'should be able to parse absolute paths', (done) ->
				signature = new Signature('foo <bar>')
				signature.compileParameters 'foo /Users/me/foo/bar', (error, result) ->
					expect(error).to.not.exist
					expect(result).to.deep.equal
						bar: '/Users/me/foo/bar'
					done()

			it 'should be able to parse relative paths', (done) ->
				signature = new Signature('foo <bar>')
				signature.compileParameters 'foo ../hello/world', (error, result) ->
					expect(error).to.not.exist
					expect(result).to.deep.equal
						bar: '../hello/world'
					done()

			it 'should be able to parse home relative paths', (done) ->
				signature = new Signature('foo <bar>')
				signature.compileParameters 'foo ~/.ssh/id_rsa.pub', (error, result) ->
					expect(error).to.not.exist
					expect(result).to.deep.equal
						bar: '~/.ssh/id_rsa.pub'
					done()

		describe 'given quoted multi word command words', ->

			it 'should parse single quoted multi words correctly', (done) ->
				signature = new Signature('foo <bar>')
				signature.compileParameters 'foo \'hello world\'', (error, result) ->
					expect(error).to.not.exist
					expect(result).to.deep.equal
						bar: 'hello world'
					done()

			it 'should parse double quoted multi words correctly', (done) ->
				signature = new Signature('foo <bar>')
				signature.compileParameters 'foo "hello world"', (error, result) ->
					expect(error).to.not.exist
					expect(result).to.deep.equal
						bar: 'hello world'
					done()
