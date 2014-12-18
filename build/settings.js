module.exports = {
  signatures: {
    wildcard: '*'
  },
  actions: {
    commandNotFound: function(command) {
      if (command != null) {
        console.error("Command not found: " + command);
      }
      return process.exit(1);
    },
    onError: function(error) {
      console.error(error.message);
      return process.exit(1);
    }
  }
};
