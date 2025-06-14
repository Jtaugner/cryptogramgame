const NewAudioContext = (function () {
     try {
         window.AudioContext = window.AudioContext || window.webkitAudioContext;
         window.audioContext = new window.AudioContext();
     } catch (e) {
         console.log("No Web Audio API support");
     }
     var WebAudioAPISoundManager = function (context) {
         this.context = context;
         this.bufferList = {};
         this.playingSounds = {};
     };
     WebAudioAPISoundManager.prototype = {
         addSound: function (url) {
             var request = new XMLHttpRequest();
             request.open("GET", url, true);
             request.responseType = "arraybuffer";
 
             var self = this;
 
             request.onload = function () {
                 self.context.decodeAudioData(
                     request.response,
                     function (buffer) {
                         if (!buffer) {
                             console.log('error decoding file data: ' + url);
                             return;
                         }
                         self.bufferList[url] = buffer;
                     });
             };
 
             request.onerror = function () {
                 console.log('BufferLoader: XHR error');
             };
 
             request.send();
         },
         stopSoundWithUrl: function (url) {
             if (this.playingSounds.hasOwnProperty(url)) {
                 for (var i in this.playingSounds[url]) {
                     if (this.playingSounds[url].hasOwnProperty(i)) {
                         this.playingSounds[url][i].stop(0);
                     }
                 }
             }
         }
     };
     var WebAudioAPISound = function (url, options) {
         this.settings = {
             loop: false
         };
         for (var i in options) {
             if (options.hasOwnProperty(i)) {
                 this.settings[i] = options[i];
             }
         }
 
         this.url = url;
         this.volume = 0.5;
         window.webAudioAPISoundManager = window.webAudioAPISoundManager || new WebAudioAPISoundManager(window.audioContext);
         this.manager = window.webAudioAPISoundManager;
         this.manager.addSound(this.url);
     };
     WebAudioAPISound.prototype = {
         play: function () {
             var buffer = this.manager.bufferList[this.url];
             //Only play if it loaded yet
             if (typeof buffer !== "undefined") {
                 var source = this.makeSource(buffer);
                 source.loop = this.settings.loop;
                 source.start(0);
                 if (!this.manager.playingSounds.hasOwnProperty(this.url)) {
                     this.manager.playingSounds[this.url] = [];
                 }
                 this.manager.playingSounds[this.url].push(source);
             }
         },
         stop: function () {
             this.manager.stopSoundWithUrl(this.url);
         },
         getVolume: function () {
             return this.volume;
         },
         //Expect to receive in range 0-100
         setVolume: function (volume) {
             this.volume = volume;
         },
         makeSource: function (buffer) {
             var source = this.manager.context.createBufferSource();
             var gainNode = this.manager.context.createGain();
             source.connect(gainNode);
             gainNode.gain.value = this.volume;
             source.buffer = buffer;
             gainNode.connect(this.manager.context.destination);
             return source;
         }
     };
     return WebAudioAPISound;
 })();
 

 const sounds = {
  'goodLetter': new NewAudioContext('./sounds/hit.wav'),
  'changeLetter': new NewAudioContext('./sounds/switch2.wav'),
  'doneLetters': new NewAudioContext('./sounds/doneLetters.wav'),
  'errorLetter': new NewAudioContext('./sounds/error3.wav'),
  'win': new NewAudioContext('./sounds/win2.wav'),
  'gameStart': new NewAudioContext('./sounds/openLevel.wav'),
  'keyboardBlocked': new NewAudioContext('./sounds/keyboardBlocked.wav'),
  'getIQ': new NewAudioContext('./sounds/getIQ.wav'),
  
 }

 export const playSound = (soundName: string) => {
  sounds[soundName as keyof typeof sounds].play();
 }

 
 
 