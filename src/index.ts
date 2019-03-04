require("@babel/polyfill");
const SkyQ = require('sky-q');
const SkyRemote = require('sky-remote');

let Service: any, Characteristic: any;

export default function(homebridge: any) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory("homebridge-sky-q-dev", "sky-q-dev", SkyQAccessory);
}

class SkyQAccessory {
  log: any;
  tvService: any;

  name: string;
  ipaddress: string;

  isOn: boolean;
  enabledServices: Array<any>;
  box: any;
  remoteControl: any;
  inputSkyQService: any;
  
  constructor(log, config) {
    this.log = log;
    this.enabledServices = [];

    this.name = config["name"] || 'Sky Q';
    this.ipaddress = config["ipaddress"];
    this.box = new SkyQ({ip:this.ipaddress})
    this.remoteControl = new SkyRemote(this.ipaddress);

    this.isOn = false;

    this.tvService = new Service.Television(this.name, "Television");

    this.tvService.setCharacteristic(Characteristic.ConfiguredName, this.name);
    this.tvService.setCharacteristic(Characteristic.Manufacturer, "Sky Q");

    this.tvService.setCharacteristic(
      Characteristic.SleepDiscoveryMode,
      Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE
    );
    this.tvService
      .getCharacteristic(Characteristic.Active)
      .on("set", this.setPowerState.bind(this))
      .on("get", this.getPowerState.bind(this));


    this.tvService
    .getCharacteristic(Characteristic.RemoteKey)
    .on("set", this.setRemoteKey);

    this.tvService
    .getCharacteristic(Characteristic.PowerModeSelection)
    .on('set', (newValue, callback) => {
        this.log.debug('SkyQ - requested tv settings (PowerModeSelection): ' + newValue);
        console.log('SkyQ - requested tv settings (PowerModeSelection): ' + newValue);

    });


    //this.tvService.setCharacteristic(Characteristic.ActiveIdentifier, 0);
    this.tvService
      .getCharacteristic(Characteristic.ActiveIdentifier)
      .on("set", this.setRemoteKey);
    
    this.inputSkyQService = new Service.InputSource("skyq", "Sky Q");
    this.inputSkyQService
      .setCharacteristic(Characteristic.Identifier, 0)
      .setCharacteristic(Characteristic.ConfiguredName, "Sky Q")
      .setCharacteristic(
        Characteristic.IsConfigured,
        Characteristic.IsConfigured.CONFIGURED
      )
      .setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.APPLICATION);

    this.tvService.addLinkedService(this.inputSkyQService);
    this.enabledServices.push(this.inputSkyQService);
  

    this.enabledServices.push(this.tvService);
  }
  
  setPowerState(state, callback) {
    this.log.debug("state", state);
    this.remoteControl.press('power', (err)=>{
      callback();
    });
  }

  getPowerState(callback) {
    this.log.debug("state", "get");
    this.box.getPowerState().then(isOn=>{
      callback(null, isOn);
    });    
  }
  setRemoteKey(newValue, callback) {
    console.log("input", newValue);
    callback(null);
  }

  createInputSource(
    id,
    name,
    number,
    type = Characteristic.InputSourceType.HDMI
  ) {
    var input = new Service.InputSource(id, name);
    input
      .setCharacteristic(Characteristic.Identifier, number)
      .setCharacteristic(Characteristic.ConfiguredName, name)
      .setCharacteristic(
        Characteristic.IsConfigured,
        Characteristic.IsConfigured.CONFIGURED
      )
      .setCharacteristic(Characteristic.InputSourceType, type);
    return input;
  }

  public getServices() {
    return this.enabledServices;
  }
}