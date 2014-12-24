_ = require('lodash')
_.str = require('underscore.string')
parse = require('./parse')

REGEX_REQUIRED = /^<(.*)>$/
REGEX_OPTIONAL = /^\[(.*)\]$/
REGEX_VARIADIC = /^[<\[](.*)[\.]{3}[>\]]$/
REGEX_MULTIWORD = /\s/

module.exports = class Parameter
	constructor: (parameter) ->

		if not parameter? or not _.isString(parameter)
			throw new Error("Missing or invalid parameter: #{parameter}")

		@parameter = parameter

	_testRegex: (regex) ->
		return regex.test(@parameter)

	isRequired: ->
		return @_testRegex(REGEX_REQUIRED)

	isOptional: ->
		return @_testRegex(REGEX_OPTIONAL)

	isVariadic: ->
		return @_testRegex(REGEX_VARIADIC)

	isWord: ->
		return not _.any [
			@isRequired()
			@isOptional()
		]

	isMultiWord: ->
		return @_testRegex(REGEX_MULTIWORD)

	getValue: ->
		return @parameter if @isWord()
		regex = REGEX_REQUIRED if @isRequired()
		regex = REGEX_OPTIONAL if @isOptional()
		regex = REGEX_VARIADIC if @isVariadic()
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
