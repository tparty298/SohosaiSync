const rl = require("readline").createInterface(process.stdin, process.stdout);
const fs = require("fs");

const settings = JSON.parse(fs.readFileSync('./settings.json'));
const client_settings = JSON.parse(fs.readFileSync('./client_settings.json'));

const {TimeStamp} = require('./TimeStamp');

const WSClient = require('./WSClient');
const OSCClientManager = require('./OSCClientManager');

const ws_client = new WSClient(settings.host, settings.port);
const osc_manager = new OSCClientManager(client_settings.ports);

let cue_points = [];

ws_client.addCallback('/control/cue_points', data => {
  console.log(data);
});
ws_client.addCallback('/control/start_points', data => {
  console.log(data);
});

ws_client.addCallback('/start_part', data => {
  osc_manager.send(`/${data.part_num}/current_time`, 0);
});

ws_client.addCallback('/end', data => {

});
