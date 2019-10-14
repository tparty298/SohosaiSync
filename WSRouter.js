
module.exports = class WSRouter {
  constructor(server) {
    this.server = server;

    this.callbacks = {};
  }

  onMessage(ws, message) {
    try{
      let data = JSON.parse(message);
      let tar = this.callbacks[data.type];

      if (tar) {
        tar.func.call(tar._this, data, ws);
      } else {
        console.log(`WSRouter: message '${data.type}' received.`);
      }
    } catch(e) {
      throw e;
      // console.error(`WSRouter: ${e}`);
    }
  }
  // callback(this, data, peer)
  addCallback(type, callback, _this = this) {
    if (typeof callback !== 'function') {
      console.error('WSRouter::addCallback callback must be a function!!');
    }

    if (this.callbacks[type]) console.warn(`WSRouter: ${type} callback override.`);

    this.callbacks[type] = {
      func: callback,
      _this: _this
    };
  }

  plotCallbackList() {
    let list = [];
    Object.keys(this.callbacks).forEach(key => list.push(`${key}  (at ${this.callbacks[key]._this.constructor.name})`));
    return list;
  }

  removeCallback(type) {
    delete this.callbacks[type];
  }
}
