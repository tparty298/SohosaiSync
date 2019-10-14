const {Client} = require('node-osc');

module.exports = class OSCClientManager {
  constructor(ports) {
    this.osc_clients = ports.map(p => new Client('127.0.0.1', p));
  }

  send(...data) {
    this.osc_clients.forEach(osc => {
      osc.send(...data);
    });
  }
};
