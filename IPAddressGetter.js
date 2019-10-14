const os = require('os');

const getIPAddress = (interfaces = ['en0']) => {
  const system_interfaces = os.networkInterfaces();

  for (let ri of interfaces) {
    try {
      return system_interfaces[ri].filter(type => type.family === 'IPv4')[0].address;
    } catch (e) {

    }
  }

  throw new Error("any requested interfaces not found");
};

module.exports = getIPAddress;
