'use strict';

const MipowDriver = require('../../lib/MipowDriver');

module.exports = class PlaybulbSmartDriver extends MipowDriver {
	DISCOVERY_SERVICE_UUID() { return '0000ff0900001000800000805f9b34fb' }
}