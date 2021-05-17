'use strict';

const MipowDevice = require('../../lib/MipowDevice');
module.exports = class PlaybulbCandleDevice extends MipowDevice {
	SERVICE_LIGHT_UUID() { 
    return '0000ff0200001000800000805f9b34fb';
  }
  HAS_BATTERY() { 
    return true;
  }
}