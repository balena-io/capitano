_ = require('lodash')
_.str = require('underscore.string')
parse = require('./parse')

REGEX_REQUIRED = /^<(.*)>$/
REGEX_OPTIONAL = /^\[(.*)\]$/
REGEX_VARIADIC = /^[<\[](.*)[\.]{3}[>\]]$/
REGEX_MULTIWORD = /\s/
REGEX_STDIN = /^[<\[]\|(.*)[\]>]$/
STDIN_CHARACTER = '|'

module.exports = class Parameter
	constructor: (parameter) ->

		if _.isNumber(parameter)
			parameter = String(parameter)

		if not parameter? or not _.isString(parameter)
			throw new Error("Missing or invalid parameter: #{parameter}")

		@parameter = parameter

		if @isVariadic() and @allowsStdin()
			throw new Error('Parameter can\'t be variadic and allow stdin')

	_testRegex: (regex) ->
		return regex.test(@parameter)

	isRequired: ->
		return @_testRegex(REGEX_REQUIRED)

	isOptional: ->
		return @_testRegex(REGEX_OPTIONAL)

	isVariadic: ->
		return @_testRegex(REGEX_VARIADIC)

	isWord: ->
		return not _.some [
			@isRequired()
			@isOptional()
		]

	isMultiWord: ->
		return @_testRegex(REGEX_MULTIWORD)

	allowsStdin: ->
		return @parameter[1] is STDIN_CHARACTER

	getValue: ->
		return @parameter if @isWord()
		regex = REGEX_REQUIRED if @isRequired()
		regex = REGEX_OPTIONAL if @isOptional()
		regex = REGEX_VARIADIC if @isVariadic()
		regex = REGEX_STDIN if @allowsStdin()
		result = @parameter.match(regex)
		return result[1]

	getType: ->
		return 'word' if @isWord()
		return 'parameter'

	matches: (parameter) ->
		return parameter is @parameter if @isWord()
		parameterWordsLength = parse.split(parameter).length

		if @isVariadic()
			return true if @isOptional()
			return false if parameterWordsLength < 1
		else
			if @isRequired()
				return false if parameterWordsLength < 1

		return true

	toString: ->

		# Preserve quotes when joining the command.
		# If a command word used to have quotes (e.g: had whitespace),
		# we explicitly quote it back.
		# https://github.com/resin-io/capitano/issues/4
		if @isMultiWord() and @isWord()
			return _.str.quote(@parameter)

		return @parameter
