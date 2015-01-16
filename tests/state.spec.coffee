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

		it 'should return the command', ->
			result = state.getMatchCommand('foo hello')
			expect(result).to.deep.equal(@command)

		it 'should return undefined if no match', ->
			result = state.getMatchCommand('bar baz foo')
			expect(result).to.be.undefined

		it 'should match variadic arguments', ->
			state.commands = []
			command = new Command
				signature: new Signature('help [command...]')
				action: _.noop
			state.commands.push(command)

			result = state.getMatchCommand('help foo bar')
			expect(result).to.deep.equal(command)

		describe 'if wildcard command is defined', ->

			beforeEach ->
				@wilcardCommand = new Command
					signature: new Signature(settings.signatures.wildcard)
					action: _.noop

				state.commands.push(@wilcardCommand)

			it 'should return that command if no match', ->
				command = state.getMatchCommand('not defined command')
				expect(command).to.deep.equal(@wilcardCommand)

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
