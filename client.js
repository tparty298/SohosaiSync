const rl = require("readline").createInterface(process.stdin, process.stdout);
const fs = require("fs");
const {execSync} = require('child_process');

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

if (client_settings.ptp_implementation === "ptpd") {
  const ptp_processes = execSync("ps aux | grep ptp").toString().split("\n").filter(e => e.indexOf('ptpd2') > -1);
  if (ptp_processes.length > 0) {
    ptp_processes.forEach(p => {
      const pid = p.split(/\s+/)[1];
      execSync(`sudo kill ${pid}`);
    });
  }

  let ptpd_result;
  try {
    let ptp_conf = fs.readFileSync('./ptpd-client-default.conf').toString();
    ptp_conf = ptp_conf.replace('INTERFACE_NAME', client_settings.ptp_interface || "en0");
    fs.writeFileSync('./ptpd-client.conf', ptp_conf);

    ptpd_result = execSync(`sudo ${client_settings.ptpd_path || "/etc/ptpd"}/src/ptpd2 -c ptpd-client.conf`).toString();
  } catch (e) {
    if (e.stdout) {
      console.log(e.stdout.toString());
      console.error(e.stderr.toString());
    } else {
      console.log(e);
    }
  }

  console.log(ptpd_result);

  const killed_result = execSync("ps aux | grep ptpd").toString().split("\n");
  console.log(killed_result);
  // execSync('sudo', ["ptpd2", "-c", "ptpd-client.conf"]);
}


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
  osc_manager.send('/control/stop');
});

let interval_func = null;

if (client_settings.debug) {
  interval_func = () => {
    if (playing) {
      let current_song_time = (time_stamp.date_milliseconds - start_date_at) * 0.001;
      client_settings.receive_parts.forEach((part, i) => {
        if (ready_points[part - 1] > current_song_time - start_date_at) {
          osc_manager.send(`/${part}/current_time`, current_song_time - start_points[part - 1]);
        }
      });

      osc_manager.send(`/current_song_time`, current_song_time);
    }
  }
} else {
  interval_func = () => {
    if (playing) {
      let current_song_time = (time_stamp.date_milliseconds - start_date_at) * 0.001;
      client_settings.receive_parts.forEach((part, i) => {
        if (ready_points[part - 1] > current_song_time - start_date_at) {
          console.log(current_song_time - start_points[part - 1]);
          osc_manager.send(`/${part}/current_time`, current_song_time - start_points[part - 1]);
        }
      });
    }
  }
}

setInterval(() => {
  interval_func();
}, 100);
