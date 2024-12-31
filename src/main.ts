/*
 * Copyright (c) 2016-2021 Moddable Tech, Inc.
 *
 *   This file is part of the Moddable SDK.
 *
 *   This work is licensed under the
 *       Creative Commons Attribution 4.0 International License.
 *   To view a copy of this license, visit
 *       <http://creativecommons.org/licenses/by/4.0>
 *   or send a letter to Creative Commons, PO Box 1866,
 *   Mountain View, CA 94042, USA.
 *
 */

//@ts-ignore
import Client from "#moddable/mqtt";
//@ts-ignore
import Timer from "#moddable/timer";
//@ts-ignore
import Net from "#moddable/net";
//@ts-ignore
import WiFi from "#moddable/wifi";

// @ts-ignore
const Digital = device.io.Digital;

const pump = new Digital({
  pin: 13,
  mode: Digital.Output,
});

new WiFi(
  {
    ssid: "YOUR WIFI SSID",
    password: "YOUR PASSWORD",
  },
  function (msg) {
    if (msg !== WiFi.gotIP) return;
    //@ts-ignore
    trace(`Wi-Fi ${msg}\n`);

    const mqtt = new Client({
      host: "MQTT SERVER HOST",
      port: 1883,
    });

    mqtt.onReady = function () {
      this.subscribe("pump");
    };
    mqtt.onMessage = function (topic, body) {
      //@ts-ignore
      trace(`received "${topic}": ${String.fromArrayBuffer(body)}\n`);
      if (topic === "pump") {
        //@ts-ignore
        const duration = `${String.fromArrayBuffer(body)}`;

        pump.write(1);

        Timer.set(() => {
          pump.write(0);
        }, duration);
      }
    };
    mqtt.onClose = function () {
      //@ts-ignore
      trace("lost connection to server\n");
      if (this.timer) {
        Timer.clear(this.timer);
        delete this.timer;
      }
    };
  }
);
