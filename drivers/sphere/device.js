'use strict';

const MipowDevice = require('../../lib/MipowDevice');
module.exports = class PlaybulbSphereDevice extends MipowDevice {
	SERVICE_LIGHT_UUID() { 
    return '0000ff0800001000800000805f9b34fb';
  }
}