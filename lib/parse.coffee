_ = require('lodash')
_.str = require('underscore.string')
minimist = require('minimist')
settings = require('./settings')
state = require('./state')

exports.normalizeInput = (argv) ->
	if argv is process.argv
		argv = argv.slice(2)

	return argv if _.isArray(argv)

	if _.isString(argv)
		return exports.split(argv)

	throw new Error('Invalid argument list')

exports.parse = (argv) ->
	argv = exports.normalizeInput(argv)
	output = minimist(argv)

	options = _.omit(output, '_')

	result = {}

	result.options = options
	result.global = exports.parseOptions(state.globalOptions, options)

	if not _.isEmpty(output._)
		result.command = output._.join(' ')

	return result

exports.split = (string) ->
	return [] if not string?

	# TODO: This regex should be vastly improved to avoid
	# having to type all special characters manually
	result = string.match(/[\w-\*/\\:\.~]+|[<\['"][^<\[]+[>\]'"]/g) or []
	return _.map result, (word) ->
		word = _.str.unquote(word, '\'')
		word = _.str.unquote(word, '"')
		return word

exports.parseOptions = (definedOptions, options = {}) ->
	result = {}

	for definedOption in definedOptions
		signature = definedOption.signature

		value = definedOption.getOptionsValue(options)
		continue if not definedOption.matches(value)
		result[signature] = _.parseInt(value) or value

	return result
