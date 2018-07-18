_ = require('lodash')
_.str = require('underscore.string')
parse = require('./parse')
Signature = require('./signature')

isValidAlias = (alias) ->
	return _.isString(alias) or _.isArray(alias)

module.exports = class Option
	constructor: (options = {}) ->

		if options.signature not instanceof Signature
			throw new Error('Missing or invalid option signature')

		if options.signature.hasParameters()
			throw new Error('Use the parameter option attribute')

		if options.alias? and not isValidAlias(options.alias)
			throw new Error('Invalid alias')

		if options.parameter? and not _.isString(options.parameter)
			throw new Error('Invalid parameter')

		if options.boolean and options.parameter?
			throw new Error('Boolean options can\'t have parameters')

		if not options.boolean and not options.parameter?
			throw new Error('Missing parameter')

		_.defaults options,
			boolean: false
			alias: []

		_.extend(this, options)

	getOptionsValue: (options) ->
		value = options[@signature]

		if not value?
			value = _.chain(options)
				.pick(@alias)
				.values()
				.first()
				.value()

		return value

	matches: (value) ->
		return false if not value?
		return not _.some [
			@boolean and not _.isBoolean(value)
			not @boolean and _.isBoolean(value)
		]

	toString: ->
		signatures = _.map [ @signature.toString() ].concat(@alias), (signature) ->
			return "-#{signature}" if signature.length <= 1
			return "--#{signature}"

		result = _.str.toSentence(signatures, ', ', ', ')
		result += " <#{@parameter}>" if @parameter?
		return result
