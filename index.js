// packages
const rl = require("readline").createInterface(process.stdin, process.stdout);
const easymidi = require('easymidi');
const {Server} = require("node-osc");

// format
const {TimeStamp} = require('./TimeStamp');

// IOs
//midi
const input = new easymidi.Input('IACドライバ バス1');

// osc
const osc_server = new Server(7373, '127.0.0.1');

// web socket
const WSServer = require('./WSServer');
const ws_server = new WSServer(false);
ws_server.time_stamp = new TimeStamp(ws_server);

//
const CuePointsManager = require('./CuePointsManager');
const cue_manager = new CuePointsManager(ws_server);

osc_server.on('message', m => {
  console.log(m);
  const path = m[0];
  const values = m.slice(1);

  if (path === '/control/cue_points') {
    let new_cue_points = CuePointsManager.convertArray2ObjectCuePoint(values);
    cue_manager.setCuePoints(new_cue_points);
  } else if (path === '/control/stop') {
    ws_server.broadcast('/control/stop');
  }
});

const start_notenums = [];
const ready_notenums = [1, 4, 6, 8, 10];

input.on('noteon', msg => {
  const current_datetime = ws_server.time_stamp.date_milliseconds;
  //   if (msg.note === 1)
  const index = ready_notenums.indexOf(msg.note);
  if (index > -1) {
    console.log(current_datetime - cue_manager.ready_points[index]);
    ws_server.broadcast("/control/start_date_at", {
      start_date_at: current_datetime - cue_manager.ready_points[index] * 1000.
    });
  }
});

rl.once("line", str => {
  ws_server.broadcast("/control/message", {
    message: str
  });

  if (str === 'exit') {
    process.exit();
  }
});

// const main = async () => {
//   await server.init();
//
//   while(loop_flag) {
//     // console.log('read');
//   }
// };

// main();
