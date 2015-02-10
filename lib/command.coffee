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

	applyPermissions: (callback) ->
		return callback() if not @permission?

		permissionFunction = state.permissions[@permission]

		if not permissionFunction?
			error = new Error("Permission not found: #{@permission}")
			return callback(error)

		permissionFunction.call(this, callback)

	# TODO: Tested implicitly by execute() tests, but it might
	# worth to test this explicitly to find other corner cases
	_parseOptions: (options) ->
		allOptions = _.union(state.globalOptions, @options)
		parsedOptions = parse.parseOptions(allOptions, options)

	execute: (args = {}, callback) ->
		@signature.compileParameters args.command, (error, params) =>
			return callback?(error) if error?

			parsedOptions = @_parseOptions(args.options)

			@applyPermissions (error) =>
				return callback?(error) if error?

				try
					@action(params, parsedOptions, callback)
				catch error
					return callback?(error)

				# Means the user is not declaring the callback
				return callback?() if @action.length < 3

	option: (option) ->
		if option not instanceof Option
			throw new Error('Invalid option')

		return if _.find(@options, option)?
		@options.push(option)

	isWildcard: ->
		return @signature.isWildcard()
