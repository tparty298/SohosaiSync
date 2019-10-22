module.exports = class CuePointsManager {
  constructor(ws_server) {
    this.ws_server = ws_server;

    this.cue_points = [];
    this.start_points = [];
  }

  setCuePoints(new_cue_points) {
    this.cue_points = new_cue_points;
    this.extractStartPoints();
    this.sendCuePoints();
  }

  extractStartPoints() {
    this.cue_points.forEach(cue => {
      const reg_result = cue.name.match(/(\d).*(start)/);

      if (reg_result) {
        console.log(cue);
        this.start_points[+reg_result[1]] = cue.time;
      }
    });

    console.log(this.start_points);
  }

  sendCuePoints() {
    this.ws_server.broadcast("/control/cue_points", this.cue_points);
    this.ws_server.broadcast("/control/start_points", this.start_points);
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
