'use strict';

const MipowDriver = require('../../lib/MipowDriver');
module.exports = class PlaybulbCandleDriver extends MipowDriver {
	DISCOVERY_SERVICE_UUID() { return '0000ff0200001000800000805f9b34fb' }
}