'use strict';

const { Device } = require('homey');
const MipowUtil = require('./MipowUtil');
module.exports = class MipowDevice extends Device {
  static SYNC_INTERVAL = 1000 * 60 * 5; // 5 min 
  static PERIPHERAL_TIMEOUT = 1000 * 30; // 30 sec

  SERVICE_LIGHT_UUID() { 
    // extend me
  }

  HAS_BATTERY() {
    // extend me
    return false;
  }

  static SERVICE_LIGHT_CHARACTERISTIC_COLOR_UUID = '0000fffc00001000800000805f9b34fb';
  static SERVICE_BATTERY_UUID = '0000180f00001000800000805f9b34fb';
  static SERVICE_BATTERY_CHARACTERISTIC_BATTERY_LEVEL_UUID = '00002a1900001000800000805f9b34fb';

  onInit() {
    this.setUnavailable().catch(this.error);

    this.registerMultipleCapabilityListener(['light_hue', 'light_saturation'], this.onCapabilityLight.bind(this), 150);
    this.registerMultipleCapabilityListener(['dim', 'light_mode', 'light_temperature'], this.onCapabilityLight.bind(this));
    this.registerCapabilityListener('onoff', async (onOff) => {
      if (onOff === false) {
        const peripheral = await this.getPeripheral();
        const buf = Buffer.from([0x00, 0x00, 0x00, 0x00]);
        return peripheral.write(this.SERVICE_LIGHT_UUID(), this.constructor.SERVICE_LIGHT_CHARACTERISTIC_COLOR_UUID, buf);
      }
      await this.onCapabilityLight({ onoff: onOff });
      return Promise.resolve();
    });

    this.homey.flow.getActionCard('pulse').registerRunListener(async args => {
      const peripheral = await args.device.getPeripheral();
      const delay = args.delay;
      const { r, g, b } = MipowUtil.hex2rgb(args.color);
      const smoothness = (args.smoothness === "smooth") ? 1 : 0;
      await peripheral.write(args.device.SERVICE_LIGHT_UUID(), '0000fffb00001000800000805f9b34fb', Buffer.from([0, r, g, b, smoothness, 0, delay, 0]));
    });

    this.homey.flow.getActionCard('rainbow').registerRunListener(async args => {
      const peripheral = await args.device.getPeripheral();
      const delay = args.delay;
      const smoothness = (args.smoothness === "smooth") ? 3 : 2;
      await peripheral.write(args.device.SERVICE_LIGHT_UUID(), '0000fffb00001000800000805f9b34fb', Buffer.from([0,0,0,0,smoothness,0,delay,0]));
    });

    this.onSync = this.onSync.bind(this);
    this.onSyncInterval = setInterval(this.onSync, this.constructor.SYNC_INTERVAL);
    this.onSync() // do an initial sync
    this.log(`PlaybulbCandleDevice has been inited`);
  }

  async getPeripheral() {
    if (!this.advertisement)
      throw new Error('Advertisement Unavailable');

    if (!this._peripheral) {
      this.log('Connecting to peripheral...');
      const peripheral = await this.advertisement.connect();
      await peripheral.assertConnected();
      await peripheral.discoverAllServicesAndCharacteristics();
      this._peripheral = peripheral;
      this.setAvailable(true);
    }

    return this._peripheral;
  }

  onSync() {
    this.log('Syncing...');

    const { address } = this.getData();

    this.driver
      .getAdvertisement({ address })
      .then(async (advertisement) => {
      this.setAvailable().catch(this.error);
      this.advertisement = advertisement;

      const peripheral = await this.getPeripheral();

      if (this.HAS_BATTERY()) {
        await peripheral.read(this.constructor.SERVICE_BATTERY_UUID, this.constructor.SERVICE_BATTERY_CHARACTERISTIC_BATTERY_LEVEL_UUID).then(async ([batteryLevel]) => {
          await this.setCapabilityValue('measure_battery', batteryLevel);
        }).catch(this.error);	
      }

      await peripheral.read(this.SERVICE_LIGHT_UUID(), this.constructor.SERVICE_LIGHT_CHARACTERISTIC_COLOR_UUID).then(async ([w, r, g, b]) => {
        
        // don't sync the values if the bulb is off
        // otherwise it will sync a dim level of 0 and a color of 0, 0, 0
        if (w === 0 && r === 0 && g === 0 && b === 0) {
          return this.setCapabilityValue('onoff', false);
        }
        this.setCapabilityValue('onoff', true);

        if (w > 0) {
          await this.setCapabilityValue('light_mode', 'temperature');
          await this.setCapabilityValue('dim', w / 255);
        } else {
          const [h, s, v] = MipowUtil.rgb2hsv(r, g, b);
          await this.setCapabilityValue('light_mode', 'color');
          await this.setCapabilityValue('dim', v);
        }
      }).catch(this.error);
    }).catch(err => {
      this.error(err);
      this.setUnavailable(err).catch(this.error);
    });
  }

  onDeleted() {
    if (this._peripheral) this._peripheral.disconnect();
    if (this.onSyncInterval) clearInterval(this.onSyncInterval);
  } 

  async onCapabilityLight({
    dim = this.getCapabilityValue('dim'),
    onoff = this.getCapabilityValue('onoff'),
    light_hue = this.getCapabilityValue('light_hue'),
    light_saturation = this.getCapabilityValue('light_saturation'),
    light_mode = this.getCapabilityValue('light_mode'),
    light_temperature = this.getCapabilityValue('light_temperature'),
  } = {}) {
    const peripheral = await this.getPeripheral();
    const buf = (async () => {

      if (onoff === false ) {
        await this.setCapabilityValue('onoff', true);
      }

      if (!dim || dim === 0) {
        await this.setCapabilityValue('dim', 1);
        dim = 1;
      }

      if (light_mode === 'temperature') {
        return Buffer.from([
          Math.floor(dim * 0xFF),
          light_temperature > 0.5 ? light_temperature * 0xFF : 0,
          0x00,
          light_temperature < 0.5 ? light_temperature * 0xFF : 0,
        ]);
      }

      if (light_mode === 'color' || light_mode === null) {
        this.log('hue, sat', light_hue, light_saturation);
        const { r, g, b } = MipowUtil.hsv2rgb(light_hue, light_saturation, dim);
        return Buffer.from([0x00, r, g, b]);
      }

      throw new Error('Unknown State');
    })();

    const buffer = await buf;
    await peripheral.write(this.SERVICE_LIGHT_UUID(), this.constructor.SERVICE_LIGHT_CHARACTERISTIC_COLOR_UUID, buffer);
  }

}