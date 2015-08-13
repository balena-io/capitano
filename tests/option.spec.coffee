chai = require('chai')
expect = chai.expect
Option = require('../lib/option')
Signature = require('../lib/signature')

describe 'Option:', ->

	describe '#constructor()', ->

		describe 'signature option', ->

			it 'should throw an error if no signature', ->
				expect ->
					new Option()
				.to.throw(Error)

			it 'should throw an error if is of type boolean and has parameter', ->
				expect ->
					new Option
						signature: new Signature('quiet')
						parameter: 'hello'
						boolean: true
				.to.throw(Error)

			it 'should throw an error if it contains a parameter in the signature', ->
				expect ->
					new Option
						signature: new Signature('quiet <hello>')
				.to.throw(Error)

		describe 'alias option', ->

			it 'should throw an error if not array or string', ->
				expect ->
					new Option
						signature: new Signature('quiet')
						alias: { q: true }
				.to.throw(Error)

		describe 'boolean option', ->

			it 'should default to false', ->
				option = new Option
					signature: new Signature('hello')
					parameter: 'name'
				expect(option.boolean).to.be.false

		describe 'parameter option', ->

			it 'should throw an error if not string', ->
				expect ->
					new Option
						signature: new Signature('hello')
						parameter: { name: 'world' }
				.to.throw(Error)

			it 'should throw an error if not defined and option is boolean', ->
				expect ->
					new Option
						signature: new Signature('hello')
						boolean: false
				.to.throw(Error)

	describe '#matches()', ->

		describe 'given boolean options', ->

			beforeEach ->
				@option = new Option
					signature: new Signature('foo')
					boolean: true

			it 'should return false if no value', ->
				expect(@option.matches()).to.be.false
				expect(@option.matches(null)).to.be.false

			it 'should return true if boolean', ->
				expect(@option.matches(true)).to.be.true
				expect(@option.matches(false)).to.be.true

			it 'should return false if not boolean', ->
				expect(@option.matches('hello')).to.be.false
				expect(@option.matches('19')).to.be.false

		describe 'given non boolean options', ->

			beforeEach ->
				@option = new Option
					signature: new Signature('foo')
					parameter: 'bar'

			it 'should return false if no value', ->
				expect(@option.matches()).to.be.false
				expect(@option.matches(null)).to.be.false

			it 'should return false for booleans', ->
				expect(@option.matches(true)).to.be.false
				expect(@option.matches(false)).to.be.false

			it 'should return true for anything else', ->
				expect(@option.matches('hello')).to.be.true
				expect(@option.matches('foo')).to.be.true
				expect(@option.matches('19')).to.be.true

	describe '#getOptionsValue()', ->

		describe 'given an option with no alias', ->

			beforeEach ->
				@option = new Option
					signature: new Signature('foo')
					parameter: 'bar'

			it 'should match with signature', ->
				options =
					foo: 'baz'
				expect(@option.getOptionsValue(options)).to.equal('baz')

			it 'should not match with an incorrect signature', ->
				options =
					baz: 'baz'
				expect(@option.getOptionsValue(options)).to.be.undefined

		describe 'given an option with one alias', ->

			beforeEach ->
				@option = new Option
					signature: new Signature('foo')
					parameter: 'bar'
					alias: 'f'

			it 'should match with signature', ->
				options =
					foo: 'baz'
				expect(@option.getOptionsValue(options)).to.equal('baz')

			it 'should give precedence to signature', ->
				options =
					foo: 'bar'
					f: 'baz'
				expect(@option.getOptionsValue(options)).to.equal('bar')

			it 'should match with alias', ->
				options =
					f: 'baz'
				expect(@option.getOptionsValue(options)).to.equal('baz')

		describe 'given an option with an array of aliases', ->

			beforeEach ->
				@option = new Option
					signature: new Signature('foo')
					parameter: 'bar'
					alias: [ 'a', 'b', 'c' ]

			it 'should match with signature', ->
				options =
					foo: 'baz'
				expect(@option.getOptionsValue(options)).to.equal('baz')

			it 'should give precedence to signature', ->
				options =
					foo: 'bar'
					a: 'baz'
					b: 'hello'
					c: 'world'
				expect(@option.getOptionsValue(options)).to.equal('bar')

			it 'should match with any alias', ->
				options = a: 'baz'
				expect(@option.getOptionsValue(options)).to.equal('baz')

				options = b: 'baz'
				expect(@option.getOptionsValue(options)).to.equal('baz')

				options = c: 'baz'
				expect(@option.getOptionsValue(options)).to.equal('baz')

	describe '#toString()', ->

		it 'should represent a multiletter boolean option with no aliases', ->
			option = new Option
				signature: new Signature('foo')
				boolean: true

			expect(option.toString()).to.equal('--foo')

		it 'should represent a monoletter boolean option with no aliases', ->
			option = new Option
				signature: new Signature('f')
				boolean: true

			expect(option.toString()).to.equal('-f')

		it 'should represent a multiletter parameter option with no aliases', ->
			option = new Option
				signature: new Signature('foo')
				parameter: 'bar'

			expect(option.toString()).to.equal('--foo <bar>')

		it 'should represent a monoletter parameter option with no aliases', ->
			option = new Option
				signature: new Signature('f')
				parameter: 'bar'

			expect(option.toString()).to.equal('-f <bar>')

		it 'should represent a multiletter boolean option with one multiletter alias', ->
			option = new Option
				signature: new Signature('foo')
				boolean: true
				alias: 'bar'

			expect(option.toString()).to.equal('--foo, --bar')

		it 'should represent a multiletter boolean option with one monoletter alias', ->
			option = new Option
				signature: new Signature('foo')
				boolean: true
				alias: 'f'

			expect(option.toString()).to.equal('--foo, -f')

		it 'should represent a monoletter boolean option with one monoletter alias', ->
			option = new Option
				signature: new Signature('f')
				boolean: true
				alias: 'b'

			expect(option.toString()).to.equal('-f, -b')

		it 'should represent a monoletter boolean option with one multiletter alias', ->
			option = new Option
				signature: new Signature('f')
				boolean: true
				alias: 'bar'

			expect(option.toString()).to.equal('-f, --bar')

		it 'should represent a multiletter parameter option with one multiletter alias', ->
			option = new Option
				signature: new Signature('foo')
				parameter: 'bar'
				alias: 'bar'

			expect(option.toString()).to.equal('--foo, --bar <bar>')

		it 'should represent a multiletter parameter option with one monoletter alias', ->
			option = new Option
				signature: new Signature('foo')
				parameter: 'bar'
				alias: 'b'

			expect(option.toString()).to.equal('--foo, -b <bar>')

		it 'should represent a monoletter parameter option with one monoletter alias', ->
			option = new Option
				signature: new Signature('f')
				parameter: 'bar'
				alias: 'b'

			expect(option.toString()).to.equal('-f, -b <bar>')

		it 'should represent a monoletter parameter option with one multiletter alias', ->
			option = new Option
				signature: new Signature('f')
				parameter: 'bar'
				alias: 'bar'

			expect(option.toString()).to.equal('-f, --bar <bar>')

		it 'should represent a multiletter boolean option with aliases', ->
			option = new Option
				signature: new Signature('foo')
				boolean: true
				alias: [ 'f', 'bar' ]

			expect(option.toString()).to.equal('--foo, -f, --bar')

		it 'should represent a multiletter parameter option with aliases', ->
			option = new Option
				signature: new Signature('foo')
				parameter: 'bar'
				alias: [ 'f', 'baz' ]

			expect(option.toString()).to.equal('--foo, -f, --baz <bar>')
