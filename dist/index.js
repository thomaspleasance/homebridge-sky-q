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

var SkyRemote = require('sky-remote');

var Service, Characteristic;
function index (homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-sky-q-dev", "sky-q-dev", SkyQAccessory);
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
    this.tvService.setCharacteristic(Characteristic.Manufacturer, "Sky Q");
    this.tvService.setCharacteristic(Characteristic.SleepDiscoveryMode, Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);
    this.tvService.getCharacteristic(Characteristic.Active).on("set", this.setPowerState.bind(this)).on("get", this.getPowerState.bind(this));
    this.tvService.getCharacteristic(Characteristic.RemoteKey).on("set", this.setRemoteKey);
    this.tvService.getCharacteristic(Characteristic.PowerModeSelection).on('set', function (newValue, callback) {
      _this.log.debug('SkyQ - requested tv settings (PowerModeSelection): ' + newValue);

      console.log('SkyQ - requested tv settings (PowerModeSelection): ' + newValue);
    }); //this.tvService.setCharacteristic(Characteristic.ActiveIdentifier, 0);

    this.tvService.getCharacteristic(Characteristic.ActiveIdentifier).on("set", this.setRemoteKey);
    this.inputSkyQService = new Service.InputSource("skyq", "Sky Q");
    this.inputSkyQService.setCharacteristic(Characteristic.Identifier, 0).setCharacteristic(Characteristic.ConfiguredName, "Sky Q").setCharacteristic(Characteristic.IsConfigured, Characteristic.IsConfigured.CONFIGURED).setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.APPLICATION);
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
    value: function setRemoteKey(newValue, callback) {
      console.log("input", newValue);
      callback(null);
    }
  }, {
    key: "createInputSource",
    value: function createInputSource(id, name, number) {
      var type = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : Characteristic.InputSourceType.HDMI;
      var input = new Service.InputSource(id, name);
      input.setCharacteristic(Characteristic.Identifier, number).setCharacteristic(Characteristic.ConfiguredName, name).setCharacteristic(Characteristic.IsConfigured, Characteristic.IsConfigured.CONFIGURED).setCharacteristic(Characteristic.InputSourceType, type);
      return input;
    }
  }, {
    key: "getServices",
    value: function getServices() {
      return this.enabledServices;
    }
  }]);

  return SkyQAccessory;
}();

module.exports = index;
