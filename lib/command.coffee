_ = require('lodash')
_.str = require('underscore.string')
parse = require('./parse')
settings = require('./settings')
state = require('./state')
Option = require('./option')
Signature = require('./signature')

module.exports = class Command
	constructor: (options = {}) ->

		if options.signature not instanceof Signature
			throw new Error('Missing or invalid command signature')

		if not _.isFunction(options.action)
			throw new Error('Missing or invalid command action')

		if options.options? and not _.isArray(options.options)
			throw new Error('Invalid options')

		@options = []

		_.each(options.options, @option, this)
		_.extend(this, _.omit(options, 'options'))

	execute: (args = {}) ->
		params = @signature.compileParameters(args.command)
		allOptions = _.union(state.globalOptions, @options)
		parsedOptions = parse.parseOptions(allOptions, args.options)
		@action.call(this, params, parsedOptions)

	option: (option) ->
		if option not instanceof Option
			throw new Error('Invalid option')

		return if _.find(@options, option)?
		@options.push(option)

	isWildcard: ->
		return @signature.isWildcard()
