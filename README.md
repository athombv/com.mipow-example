# Mipow

This repository serves as inspiration for your own Homey app, to help you understand Homey Apps SDK concepts in a real-life context.

Read the [Homey Apps SDK Documentation](https://apps.developer.homey.app) for more information about developing apps for Homey.

> Because this repository is a clone of the live code, pull requests will be ignored.

## What does this app do?

The Mipow app uses Bluetooth Low Energy to connect with a variety of Mipow lights. 

To make sure the lights turn on and off quickly the connection will not be closed. However, a polling mechanism has been implemented to synchronize the colors of the lights with Homey and quickly reconnect in case a light has been manually turned off.

Each type of Mipow device can be identified by a service UUID which is exposed in the advertisement. The lights are being set by writing to the color characteristic `0000fffc00001000800000805f9b34fb` or to the animation characteristic `0000fffb00001000800000805f9b34fb`.

Read more about developing Bluetooth Low Energy apps for Homey at https://apps.developer.homey.app/wireless/bluetooth.
