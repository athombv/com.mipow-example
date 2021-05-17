'use strict';

const MipowDriver = require('../../lib/MipowDriver');
module.exports = class PlaybulbSphereDriver extends MipowDriver {
	DISCOVERY_SERVICE_UUID() { return '0000ff0800001000800000805f9b34fb' }
}