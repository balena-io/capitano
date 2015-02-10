_ = require('lodash')
chai = require('chai')
expect = chai.expect

state = require('../lib/state')
Command = require('../lib/command')
Signature = require('../lib/signature')
settings = require('../lib/settings')

describe 'State:', ->

	it 'should have a commands array', ->
		expect(state.commands).to.be.an.instanceof(Array)

	it 'should have a globalOptions array', ->
		expect(state.globalOptions).to.be.an.instanceof(Array)

	it 'should have a permissions object', ->
		expect(_.isObject(state.permissions)).to.be.true
		expect(_.isArray(state.permissions)).to.be.false

	describe '#getMatchCommand()', ->

		beforeEach ->
			@command = new Command
				signature: new Signature('foo <bar>')
				action: _.noop

			state.commands = []
			state.commands.push(@command)

		it 'should return the command', (done) ->
			state.getMatchCommand 'foo hello', (error, result) =>
				expect(error).to.not.exist
				expect(result).to.deep.equal(@command)
				done()

		it 'should return undefined if no match', (done) ->
			state.getMatchCommand 'bar baz foo', (error, result) ->
				expect(error).to.not.exist
				expect(result).to.be.undefined
				done()

		it 'should match variadic arguments', (done) ->
			state.commands = []
			command = new Command
				signature: new Signature('help [command...]')
				action: _.noop
			state.commands.push(command)

			state.getMatchCommand 'help foo bar', (error, result) ->
				expect(error).to.not.exist
				expect(result).to.deep.equal(command)
				done()

		it 'should match required stdin arguments', (done) ->
			state.commands = []
			command = new Command
				signature: new Signature('foo <|bar>')
				action: _.noop
			state.commands.push(command)

			state.getMatchCommand 'foo', (error, result) ->
				expect(error).to.not.exist
				expect(result).to.deep.equal(command)
				done()

		it 'should match optional stdin arguments', (done) ->
			state.commands = []
			command = new Command
				signature: new Signature('foo [|bar]')
				action: _.noop
			state.commands.push(command)

			state.getMatchCommand 'foo', (error, result) ->
				expect(error).to.not.exist
				expect(result).to.deep.equal(command)
				done()

		describe 'if wildcard command is defined', ->

			beforeEach ->
				@wilcardCommand = new Command
					signature: new Signature(settings.signatures.wildcard)
					action: _.noop

				state.commands.push(@wilcardCommand)

			it 'should return that command if no match', (done) ->
				state.getMatchCommand 'not defined command', (error, result) =>
					expect(error).to.not.exist
					expect(result).to.deep.equal(@wilcardCommand)
					done()

	describe '#findCommandBySignature()', ->

		beforeEach ->
			state.commands = []

			state.commands.push new Command
				signature: new Signature('foo <bar>')
				action: _.noop

			state.commands.push new Command
				signature: new Signature('bar <baz>')
				action: _.noop

			state.commands.push new Command
				signature: new Signature('version')
				action: _.noop

		it 'should be able to find a command', ->
			command = state.findCommandBySignature('version')
			expect(command).to.be.an.instanceof(Command)
			expect(command.signature.toString()).to.equal('version')

		it 'should return undefined if not found', ->
			command = state.findCommandBySignature('not defined command')
			expect(command).to.be.undefined
