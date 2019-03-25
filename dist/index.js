'use strict';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

require("@babel/polyfill");

var SkyQ = require('sky-q');

var SkyQApi = require('SkyQApi');

var SkyRemote = require('sky-remote');

var Service, Characteristic;
function index (homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-sky-q-experimental", "sky-q-experimental", SkyQAccessory);
}

var SkyQAccessory =
/*#__PURE__*/
function () {
  function SkyQAccessory(log, config) {
    var _this = this;

    _classCallCheck(this, SkyQAccessory);

    _defineProperty(this, "log", void 0);

    _defineProperty(this, "tvService", void 0);

    _defineProperty(this, "name", void 0);

    _defineProperty(this, "ipaddress", void 0);

    _defineProperty(this, "isOn", void 0);

    _defineProperty(this, "enabledServices", void 0);

    _defineProperty(this, "box", void 0);

    _defineProperty(this, "remoteControl", void 0);

    _defineProperty(this, "inputSkyQService", void 0);

    this.log = log;
    this.enabledServices = [];
    this.name = config["name"] || 'Sky Q';
    this.ipaddress = config["ipaddress"];
    this.box = new SkyQ({
      ip: this.ipaddress
    });
    this.remoteControl = new SkyRemote(this.ipaddress);
    this.isOn = false;
    this.tvService = new Service.Television(this.name, "Television");
    this.tvService.setCharacteristic(Characteristic.ConfiguredName, this.name);
    this.tvService.setCharacteristic(Characteristic.SleepDiscoveryMode, Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);
    this.tvService.getCharacteristic(Characteristic.Active).on("set", this.setPowerState.bind(this)).on("get", this.getPowerState.bind(this));
    this.tvService.getCharacteristic(Characteristic.RemoteKey).on("set", this.setRemoteKey.bind(this));
    this.tvService.getCharacteristic(Characteristic.PowerModeSelection).on('set', function (newValue, callback) {
      _this.log.debug('SkyQ - requested tv settings (PowerModeSelection): ' + newValue);

      console.log('SkyQ - requested tv settings (PowerModeSelection): ' + newValue);
      callback();
    });
    this.inputSkyQService = new Service.InputSource("skyq", "Sky Q");
    this.inputSkyQService.setCharacteristic(Characteristic.Identifier, 0).setCharacteristic(Characteristic.ConfiguredName, "Sky Q").setCharacteristic(Characteristic.IsConfigured, Characteristic.IsConfigured.CONFIGURED).setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.HOME_SCREEN);
    this.tvService.addLinkedService(this.inputSkyQService);
    this.enabledServices.push(this.inputSkyQService);
    this.enabledServices.push(this.tvService);
  }

  _createClass(SkyQAccessory, [{
    key: "setPowerState",
    value: function setPowerState(state, callback) {
      this.log.debug("state", state);
      this.remoteControl.press('power', function (err) {
        callback();
      });
    }
  }, {
    key: "getPowerState",
    value: function getPowerState(callback) {
      this.log.debug("state", "get");
      this.box.getPowerState().then(function (isOn) {
        callback(null, isOn);
      });
    }
  }, {
    key: "setRemoteKey",
    value: function setRemoteKey(state, callback) {
      console.log("input", state);
      console.log("Setting key state...");
      var input_key;

      switch (state) {
        case Characteristic.RemoteKey.ARROW_UP:
          input_key = 'up';
          break;

        case Characteristic.RemoteKey.ARROW_DOWN:
          input_key = 'down';
          break;

        case Characteristic.RemoteKey.ARROW_LEFT:
          input_key = 'left';
          break;

        case Characteristic.RemoteKey.ARROW_RIGHT:
          input_key = 'right';
          break;

        case Characteristic.RemoteKey.SELECT:
          input_key = 'select';
          break;

        case Characteristic.RemoteKey.EXIT:
          input_key = 'dismiss';
          break;

        case Characteristic.RemoteKey.BACK:
          input_key = 'backup';
          break;

        case Characteristic.RemoteKey.PLAY_PAUSE:
          input_key = 'play';
          break;

        case Characteristic.RemoteKey.INFORMATION:
          input_key = 'i';
          break;
      }

      if (input_key) {
        this.remoteControl.press(input_key, function (err) {
          callback();
        });
      }
    }
  }, {
    key: "getServices",
    value: function getServices() {
      return this.enabledServices;
    }
  }, {
    key: "getManufacturer",
    value: function getManufacturer() {
      return 'Sky';
    }
  }, {
    key: "getModel",
    value: function getModel() {
      return 'Sky Q';
    }
  }]);

  return SkyQAccessory;
}();

module.exports = index;
