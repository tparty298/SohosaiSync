module.exports = class CuePointsManager {
  constructor(ws_server) {
    this.ws_server = ws_server;

    this.cue_points = [];
    this.start_points = [];
    this.ready_points = [];

    setInterval(() => {
      this.sendPoints();
    }, 20000);
  }

  setCuePoints(new_cue_points) {
    this.cue_points = new_cue_points;
    this.start_points = this.extractPoints(/(\d).*start/);
    this.ready_points = this.extractPoints(/(\d).*ready/);
    this.sendPoints();
  }

  extractPoints(reg) {
    const result = [];
    this.cue_points.forEach(cue => {
      const reg_result = cue.name.match(reg);

      if (reg_result) {
        result[+reg_result[1] - 1] = cue.time;
    }
    });

    return result;
  }

  sendPoints() {
    this.ws_server.broadcast("/control/start_points", {start_points: this.start_points});
    this.ws_server.broadcast("/control/ready_points", {ready_points: this.ready_points});
  }

  static convertArray2ObjectCuePoint(data) {
    const ret_array = [];

    if (data.length % 2 !== 0) {
      console.error("invalid message:: cue_points");
      return [];
    }

    for (let i = 0; i < data.length; i += 2) {
      ret_array.push({
        name: data[i],
        time: data[i + 1]
      });
    }

    return ret_array;
  };
};
