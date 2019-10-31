const fs = require('fs');
const https = require('https');
const http = require('http');
const WebSocket = require('ws');

const WSRouter = require('./WSRouter');
const getIPAddress = require('./IPAddressGetter');

const address = getIPAddress(  ['en13', 'en0', 'lo0']);

const SOCKET_PORT = 7353;

console.log(address);

module.exports = class WSServer {
  constructor(ssl = false) {
    this.ssl = ssl;

    if (this.ssl) {
      const ssl_options = {
        key: fs.readFileSync(`./ssl/${address}.key`),
        cert: fs.readFileSync(`./ssl/${address}.crt`)
      };

      console.log(ssl_options);

      this.ws_server = new https.createServer(ssl_options);
    } else {
      this.ws_server = new http.createServer();
    }

    this.wss = new WebSocket.Server({server: this.ws_server});

    this.wss.on('connection', ws => {


      console.log("new connection");
      ws.on('message', message => {
        this.router.onMessage(ws, message);
      });

      ws.on('close', () => {
        ws.terminate();
      });

      ws.on('disconnect', () => {
        ws.terminate();
      });
    });

    this.ws_server.listen(SOCKET_PORT);

    this.router = new WSRouter(this);
  }

  async init() {
    // plot callback mapping
    console.log(`
--------------------------------------------------------
${this.router.plotCallbackList().join('\n')}      
--------------------------------------------------------
    `);
  }

  send(connection, type, data = {}) {
    console.log(connection);
    connection.send(JSON.stringify(Object.assign(data, {type: type})));
  }

  broadcast(type, data = {}) {
    const send_data = JSON.stringify(Object.assign({}, data, {type: type}));
    this.wss.clients.forEach(function(client) {
      client.send(send_data);
    });
  }

  onConnection(ws) {
    ws.on('message', this.message_callback);
    ws.on('disconnect')
  }

  onMessage(message) {

  }

  onDisconnect() {

  }
};

