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
         this.volume = 0.4;
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
  'errorLetter': new NewAudioContext('./sounds/error-sound.mp3'),
  'win': new NewAudioContext('./sounds/win2.wav'),
  'keyboardBlocked': new NewAudioContext('./sounds/keyboardBlocked.wav'),
  'getIQ': new NewAudioContext('./sounds/getIQ.wav'),
  'changeWindow': new NewAudioContext('./sounds/flip.wav'),
  'music': new NewAudioContext('./sounds/music.mp3', {loop: true}),
  'addMoney': new NewAudioContext('./sounds/addMoney.wav'),
  'click': new NewAudioContext('./sounds/click.wav'),
  
 }

 sounds['errorLetter'].setVolume(0.75);
 sounds['doneLetters'].setVolume(0.3);
 sounds['changeLetter'].setVolume(0.15);
 sounds['keyboardBlocked'].setVolume(0.25);
 sounds['changeWindow'].setVolume(0.1);
 sounds['music'].setVolume(0.05);
 sounds['click'].setVolume(0.15);

export const playSound = (soundName: string) => {
  sounds[soundName as keyof typeof sounds].play();
}
export const stopSound = (soundName: string) => {
    sounds[soundName as keyof typeof sounds].stop();
}

export function switchOnMainMusic(){
	try{
		window.audioContext.resume();
	}catch(e){}
}
export function switchOffMainMusic(){
	try{
		window.audioContext.suspend();
	}catch(e){}
}
 
window.addEventListener("visibilitychange", () => {
	try{
        if(__PLATFORM__ === 'gp'){
            return;
        }
		if (document.visibilityState === "visible" && !musicStoppedByAdv) {
			switchOnMainMusic()
		}else{
			switchOffMainMusic();
		}
	}catch(e){console.log(e)}

});
 
 