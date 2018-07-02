_ = require('lodash')
_.str = require('underscore.string')
yargsParser = require('yargs-parser')
settings = require('./settings')
state = require('./state')
Parameter = require('./parameter')

exports.normalizeInput = (argv) ->
	if argv is process.argv
		argv = argv.slice(2)

	return argv if _.isArray(argv)

	if _.isString(argv)
		return exports.split(argv)

	throw new Error('Invalid argument list')

exports.parse = (argv) ->
	argv = exports.normalizeInput(argv)
	output = yargsParser argv,
		configuration:
			'parse-numbers': false

	options = _.omit(output, '_')

	result = {}

	result.options = _.mapValues options, (value) ->
		if /^\d+$/.test(value)
			return parseInt(value)
		if /^\d*\.\d+?$/.test(value)
			return parseFloat(value)
		return value

	result.global = exports.parseOptions(state.globalOptions, options)

	if not _.isEmpty(output._)
		output._ = _.map output._, (word) ->
			wordParameter = new Parameter(word)
			return wordParameter.toString()

		result.command = output._.join(' ')

	return result

exports.split = (string) ->
	return [] if not string?

	# TODO: Refactor this to use a manual lexer
	regex = ''

	pair = ([ start, end ]) ->
		start = '\\' + start
		end = '\\' + end
		middle = '\\\\' + end
		regex += "#{start}(?:[^#{middle}]|\\\\.)*#{end}|"

	pair('[]')
	pair('<>')
	pair('""')
	pair("''")

	regex += '\\S+'

	result = string.match(new RegExp(regex, 'g')) or []

	return _.map result, (word) ->
		word = _.str.unquote(word, '\'')
		word = _.str.unquote(word, '"')
		return word

exports.parseOptions = (definedOptions, options = {}) ->
	result = {}

	for definedOption in definedOptions
		signature = definedOption.signature

		value = definedOption.getOptionsValue(options)

		if definedOption.required? and not value?
			if _.isString(definedOption.required)
				throw new Error(definedOption.required)
			else if definedOption.required
				throw new Error("Option #{definedOption.signature} is required")

		continue if not definedOption.matches(value)

		if /^\d+$/.test(value)
			value = _.parseInt(value)

		result[signature] = value

	return result
