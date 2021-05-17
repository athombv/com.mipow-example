'use strict';

const { Driver } = require('homey');

module.exports = class MipowDriver extends Driver {

  static DISCOVER_INTERVAL = 1000 * 60 * 1; // 1 minute
  
  DISCOVERY_SERVICE_UUID() { 
    // extend me
  }

  async onInit() {
    this.advertisements = {};
    this.onDiscover = this.onDiscover.bind(this);
    this.onDiscoverInterval = setInterval(this.onDiscover, this.constructor.DISCOVER_INTERVAL);
    await this.onDiscover();
    this.log('PlaybulbCandleDriver has been inited');
  }

  async onDiscover() {
    this.log('Discovering...');
    this.log('looking for service uuid:', this.DISCOVERY_SERVICE_UUID());

    const advertisements = await this.homey.ble.discover([this.DISCOVERY_SERVICE_UUID()]).catch(this.error);
    this.log(`Found ${advertisements.length} devices.`)
    advertisements.forEach(advertisement => {
      if (!this.advertisements[advertisement.address]) {
        this.advertisements[advertisement.address] = advertisement;
        this.emit(`advertisement:${advertisement.address}`, advertisement);
      }
    });
  }

  async onPairListDevices() {
    return Object.entries(this.advertisements).map(([address, advertisement]) => ({
      data: { address },
      name: advertisement.localName,
    }));
  }

  async getAdvertisement({ address }) {
    if (this.advertisements[address])
      return this.advertisements[address];

    return new Promise(resolve => {
      this.once(`advertisement:${address}`, resolve);
    })
  }

}