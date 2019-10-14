const rl = require("readline").createInterface(process.stdin, process.stdout);

const {TimeStamp} = require('./TimeStamp');

const WSServer = require('./WSServer');
const server = new WSServer(false);
server.time_stamp = new TimeStamp(server);

setInterval(() => {

  server.broadcast("/start_part", {
    part_num: 1
  });
}, 1000);

let loop_flag = true;

rl.once("line", str => {
  console.log("str:", str);

  if (str === 'exit') {
    loop_flag = false;

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
