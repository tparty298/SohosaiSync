const DateWithOffset = require('date-with-offset');

const stamp2Float = (stamp = [0,0]) => {
  return (stamp[0] * 1e9 + stamp[1]) * 0.000001;
};

module.exports.getTimeStamp = stamp2Float;
module.exports.TimeStamp = class TimeStamp {
  constructor(){
    console.log(new DateWithOffset(0).getTime(), this.current_time);

    this.init();

    console.log(`Timestamp: init_time ${this.init_time}`);
  }

  init() {
    this.init_time = new DateWithOffset(0).getTime();
    this.init_hrtime = process.hrtime();
  }

  get current_time() {
    return stamp2Float(process.hrtime(this.init_hrtime));
  }

  get date_milliseconds() {
    return this.current_time + this.init_time;
  }

  get current_timestamp_splitted() {
    return this.date_milliseconds.toString().split('.');
  }
};
