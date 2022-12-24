'use strict';

const MipowDriver = require('../../lib/MipowDriver');
module.exports = class PlaybulbCandleDriver extends MipowDriver {
	DISCOVERY_SERVICE_UUID() { return '0000fe0b00001000800000805f9b34fb' }
}