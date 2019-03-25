require("@babel/polyfill");
const SkyQ = require('sky-q');

const SkyRemote = require('sky-remote');

let Service: any, Characteristic: any;

export default function(homebridge: any) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory("homebridge-sky-q-experimental", "sky-q-experimental", SkyQAccessory);
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
    .on("set", this.setRemoteKey.bind(this));

    this.tvService
    .getCharacteristic(Characteristic.PowerModeSelection)
    .on('set', (newValue, callback) => {
        this.log.debug('SkyQ - requested tv settings (PowerModeSelection): ' + newValue);
        console.log('SkyQ - requested tv settings (PowerModeSelection): ' + newValue);
        callback();
    });
    
    this.inputSkyQService = new Service.InputSource("skyq", "Sky Q");
    this.inputSkyQService
      .setCharacteristic(Characteristic.Identifier, 0)
      .setCharacteristic(Characteristic.ConfiguredName, "Sky Q")
      .setCharacteristic(
        Characteristic.IsConfigured,
        Characteristic.IsConfigured.CONFIGURED
      )
      .setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.HOME_SCREEN);

    this.tvService.addLinkedService(this.inputSkyQService);
    this.enabledServices.push(this.inputSkyQService);
  

    this.enabledServices.push(this.tvService);
  }
  
  setPowerState(state, callback) {
    console.log("state", state);
    this.remoteControl.press('power', (err)=>{
      callback();
    });
  }

  getPowerState(callback) {
    console.log("state", "get");
    this.box.getPowerState().then(isOn=>{
      callback(null, isOn);
    });    
  }
  setRemoteKey(state, callback) {
    console.log("input", state);
    console.log("Setting key state...");
    var input_key;
    switch (state)
    {
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
    if(input_key)
    {
      this.remoteControl.press(input_key, (err)=>{
        callback();
      });
    } 
  }

  public getServices() {
    return this.enabledServices;
  }

  public getManufacturer() {
    return 'Sky';
  }

  public getModel() {
    return 'Sky Q';
  }
}