var data = require('self').data;
var ss = require("simple-storage");

ss.storage.batteryBackground = "light";

var batteryPanel = require("panel").Panel({
  width: 180,
  height: 45,
  contentURL: data.url("panel.html"),
  contentScript:'var select = document.getElementsByTagName("select")[0];'+
                'select.onchange = function(){'+
                  'self.postMessage(select.options[select.selectedIndex].value);'+
                '};',
  onMessage: function(message){
    ss.storage.batteryBackground = message;
    this.hide();
  }
});

require("widget").Widget({
  id: "battery-monitor",
  label: "Battery Monitor",
  width: 32,
  panel: batteryPanel,
  contentURL: data.url("icons/"+ss.storage.batteryBackground+"/charging/charged.svg"),
  contentScriptWhen: "ready",
  contentScript:'self.postMessage({ charging: navigator.mozBattery.charging, level: navigator.mozBattery.level * 100, chargingTime: navigator.mozBattery.chargingTime, dischargingTime: navigator.mozBattery.dischargingTime });'+
                'navigator.mozBattery.addEventListener("chargingchange", function() {'+
                  'self.postMessage({ charging: navigator.mozBattery.charging, level: navigator.mozBattery.level * 100, chargingTime: navigator.mozBattery.chargingTime, dischargingTime: navigator.mozBattery.dischargingTime });'+
                '});'+
                'navigator.mozBattery.addEventListener("levelchange", function() {'+
                  'self.postMessage({ charging: navigator.mozBattery.charging, level: navigator.mozBattery.level * 100, chargingTime: navigator.mozBattery.chargingTime, dischargingTime: navigator.mozBattery.dischargingTime });'+
                '});',
  onMessage: function(message){
    // set icon
    if(message.level != 100){
      var url = "icons/"+ss.storage.batteryBackground+"/";
      if(message.charging){
        url = url + "charging/"
      }
      this.contentURL = data.url(url + Math.round(message.level/20)*20 + ".svg");
    } else {
      this.contentURL = data.url("icons/"+ss.storage.batteryBackground+"/charging/charged.svg");
    }
    // set tooltip
    var text = Math.round(message.level/1)*1 + "%";
    var time = message.chargingTime || message.dischargingTime;
    if(message.level != 100){
      if(message.chargingTime != null){
        var state = "full";
      } else {
        var state = "empty";
      }
      var hours = Math.floor(time / (60 * 60));
      var divisor_for_minutes = time % (60 * 60);
      var minutes = Math.floor(divisor_for_minutes / 60);
      if(hours != 0){
        text = text + " " + hours + " hrs,";
      }
      text = text + " " + minutes + " mins till " + state;
    }
    this.tooltip = text;
  }
});

console.log("The add-on is running.");
