path = require('path')
_ = require('lodash')
_.str = require('underscore.string')
minimist = require('minimist')
settings = require('./settings')
state = require('./state')
Parameter = require('./parameter')

exports.parseArgv = (argv, filename = __filename) ->
	index = _.indexOf(argv, filename)

	if index is -1
		index = _.indexOf(argv, path.basename(filename))

	if index isnt -1
		argv = argv.slice(index + 1)

	return argv

exports.normalizeInput = (argv, filename) ->
	argv = exports.parseArgv(argv, filename)

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
		regex += "#{start}[^#{end}]+#{end}|"

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
		continue if not definedOption.matches(value)
		result[signature] = _.parseInt(value) or value

	return result
