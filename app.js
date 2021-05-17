'use strict';

const Homey = require('homey');

module.exports = class MipowAppApp extends Homey.App {

	onInit() {
		this.log('MipowApp is running...');
	}

}