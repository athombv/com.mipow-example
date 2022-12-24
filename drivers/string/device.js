'use strict';

const MipowDevice = require('../../lib/MipowDevice');
module.exports = class PlaybulbCandleDevice extends MipowDevice {
	SERVICE_LIGHT_UUID() { 
    return '0000fe0b00001000800000805f9b34fb';
  }
  HAS_BATTERY() { 
    return true;
  }
}