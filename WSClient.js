const WebSocket = require('ws');

module.exports = class WSClient {
  constructor(host = "127.0.0.1", port = 9001, ssl = false) {
    this.ready = false;

    this.callbacks = {};

    this.host = host;
    this.port = port;
    this.ssl = ssl;

    this.connect();
    this.init();

    process.on('exit', () => this.close());
  }

  connect() {
    console.log("connect");
    this.socket = new WebSocket(`${this.ssl ? "wss" : "ws"}://${this.host}:${this.port}/websocket`);
  }

  send(type, data = {}) {
    this.socket.send(JSON.stringify(Object.assign(data, {type: type})));
  }

  init() {
    this.socket.onopen = e => this.onConnected(e);
    this.socket.onmessage = e => this.onMessage(e);
    this.socket.onclose = e => this.onClose(e);
    this.socket.onerror = e => this.onError(e);
  }

  onConnected(e) {
    console.log('ws_client connected');
    this.ready = true;
  }

  onMessage(e) {
    if (!e) return;

    let data = JSON.parse(e.data);
    let tar = this.callbacks[data.type];
    if (tar) {
      tar.func.call(tar._this, data, e.timeStamp);
    } else {
      console.log(`WSClient:: message '${data.type}' is received.`);
      console.log(e);
    }
  }

  onClose(e) {
    console.log('WSClient:: websocket close.');


    console.log(this.socket);
    this.connect();
  }

  onError(e) {
    console.error(e);

    this.socket.close();


    this.connect();
  }

  addCallback(type, callback, _this = this) {
    if (this.callbacks[type]) console.warn(`WSRouter: ${type} callback override.`);

    this.callbacks[type] = {
      func: callback,
      _this: _this
    };
  }

  removeCallback(type) {
    delete this.callbacks[type];
  }

  close() {
    this.ws_client.send('/signaling/disconnection', {
      position: this.position.data
    });

    this.socket.close();
  }
};
