var Command, Option, Signature, parse, settings, state, _;

_ = require('lodash');

_.str = require('underscore.string');

parse = require('./parse');

settings = require('./settings');

state = require('./state');

Option = require('./option');

Signature = require('./signature');

module.exports = Command = (function() {
  function Command(options) {
    if (options == null) {
      options = {};
    }
    if (!(options.signature instanceof Signature)) {
      throw new Error('Missing or invalid command signature');
    }
    if (!_.isFunction(options.action)) {
      throw new Error('Missing or invalid command action');
    }
    if ((options.options != null) && !_.isArray(options.options)) {
      throw new Error('Invalid options');
    }
    this.options = [];
    _.each(options.options, this.option, this);
    _.extend(this, _.omit(options, 'options'));
  }

  Command.prototype.execute = function(args) {
    var allOptions, params, parsedOptions;
    if (args == null) {
      args = {};
    }
    params = this.signature.compileParameters(args.command);
    allOptions = _.union(state.globalOptions, this.options);
    parsedOptions = parse.parseOptions(allOptions, args.options);
    return this.action.call(this, params, parsedOptions);
  };

  Command.prototype.option = function(option) {
    if (!(option instanceof Option)) {
      throw new Error('Invalid option');
    }
    if (_.find(this.options, option) != null) {
      return;
    }
    return this.options.push(option);
  };

  Command.prototype.isWildcard = function() {
    return this.signature.isWildcard();
  };

  return Command;

})();
