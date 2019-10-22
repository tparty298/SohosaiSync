const rl = require("readline").createInterface(process.stdin, process.stdout);
const fs = require("fs");

const settings = JSON.parse(fs.readFileSync('./settings.json'));
const client_settings = JSON.parse(fs.readFileSync('./client_settings.json'));

const {TimeStamp} = require('./TimeStamp');
const time_stamp = new TimeStamp();

const WSClient = require('./WSClient');
const OSCClientManager = require('./OSCClientManager');

const ws_client = new WSClient(settings.host, settings.port);
const osc_manager = new OSCClientManager(client_settings.ports);

let cue_points = [];
let start_date_at = 0.;
let start_points = [];
let ready_points = [];
let playing = false;

ws_client.addCallback('/control/start_points', data => {
  start_points = data.start_points;
  console.log("start", start_points);
});

ws_client.addCallback('/control/ready_points', data => {
  ready_points = data.ready_points;
  console.log("ready", ready_points);
});

ws_client.addCallback('/control/start_date_at', data => {
  playing = true;
  start_date_at = data.start_date_at;
});

ws_client.addCallback('/control/stop', () => {
  playing = false;
});

setInterval(() => {
  if (playing) {
    let current_song_time = (time_stamp.date_milliseconds - start_date_at) * 0.001;
    client_settings.receive_parts.forEach((part, i) => {
      if (ready_points[part - 1] > current_song_time  - start_date_at) {
        osc_manager.send(`/${part}/current_time`, current_song_time  - start_points[part - 1]);
      }
    });

    osc_manager.send(`/current_song_time`, current_song_time);
  }
}, 100);
