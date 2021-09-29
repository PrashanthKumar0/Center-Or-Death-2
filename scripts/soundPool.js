class Sound {
    constructor(name, url) {
        this.name = name;
        this.url = url;
        this.aud = null;
        this.loaded = false;
    }
}

class SoundPool {
    constructor(sounds, onLoadedCallback, onLoadProgress) {
        this.onLoadedCallback = onLoadedCallback;
        this.onLoadProgress = onLoadProgress;
        this.sounds = sounds;
        this.numLoaded = 0;
        this.totalSounds = this.sounds.length;
        this.loaded = false;
        this.playDelay = 60;
        this.pauseDelay = 10;
        this.time_then = 0;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.sound_pool = [];
        this.MAX_SOUND_TRACKS = 100;
        // validity Check
        // for (let i = 0; i < sounds.length; i++) {
        //     if (!(sounds[i].name && sounds[i].url && sounds[i].aud)) throw "Error Invalid Sound at index : " + (i);
        // }
        for (let i = 0; i < this.sounds.length; i++) {
            this.sounds[i].aud = new Audio();
            this.sounds[i].aud.oncanplaythrough = this.onLoad.bind(this); //!ISSUE :fires after song ends :(
            // this.sounds[i].aud.onload = this.onLoad.bind(this); //?not working??
            this.sounds[i].aud.src = this.sounds[i].url;
        }
    }

    init() {
        for (let i = 0; i < this.sounds.length; i++) {
            this.sounds[i].aud.volume = 0;
            //   this.sounds[i].aud.play().then((p) => {
            //     this.sounds[i].aud.pause();
            //     this.sounds[i].aud.currentTime = 0;
            //   });
            this.sounds[i].aud.play();
            this.sounds[i].aud.pause();
            this.sounds[i].aud.currentTime = 0;
        }
    }

    onLoad(ev) {
        // for(let i=0;i<this.sounds.length;i++){
        //     if(ev.target===this.sounds[i]){
        //         console.log(ev);
        //         return;
        //     }
        // }
        if (ev.target.loaded) {
            return;
        } else {
            ev.target.loaded = true; //cool Problem solved? 🤣
        }
        this.numLoaded++;
        if (this.onLoadProgress) {
            this.onLoadProgress(this.numLoaded, this.totalSounds);
        }
        if (this.numLoaded == this.totalSounds) {
            this.loaded = true;
            if (this.onLoadedCallback) this.onLoadedCallback();
        }
    }

    play(name, volume = 0.7, delayTime, pool = false) {
        let now = performance.now();

        if (this.time_then == 0) {
            this.time_then = now;
        } else {
            let dt = now - this.time_then;
            if (dt <= (delayTime || this.playDelay)) {
                return 0;
            } else {
                this.time_then = now;
            }
            // console.log("dt", dt);
        }

        for (let i = 0; i < this.sounds.length; i++) {
            if (this.sounds[i].name == name) {
                // if (this.sounds[i].aud.paused) {
                this.sounds[i].aud.volume = volume;
                this.sounds[i].aud.currentTime = 0;
                if (this.sounds[i].aud.paused) {
                    this.sounds[i].aud.play(); // play main file if all slot is full
                    this.sounds[i].aud.loop = false;
                }
                // }
            }
        }

        // ANCHOR : This doesnt work on android :(
        // for (let i = 0; i < this.sounds.length; i++) {
        //   if (this.sounds[i].name == name) {
        //     // this.sounds[i].aud.play();
        //     if (this.sound_pool.length >= this.MAX_SOUND_TRACKS && !pool) {
        //       if (this.sounds[i].aud.paused) {
        //         this.sounds[i].aud.volume = volume;
        //         this.sounds[i].aud.currentTime = 0;
        //         this.sounds[i].aud.play(); // play main file if all slot is full
        //       }
        //     } else {
        //       // else play on sound_pool
        //       let aud = new Audio(this.sounds[i].url);
        //       aud.play();
        //       aud.volume = volume;
        //       this.sound_pool.push(aud);
        //       aud.onended = this.onTrackEnd.bind(this);
        //     }
        //   }
        // }
    }

    playBgm(name, volume = 0.3, loop = false) {
        for (let i = 0; i < this.sounds.length; i++) {
            if (this.sounds[i].name == name) {
                if (this.sounds[i].aud.paused) {
                    this.sounds[i].aud.play();
                }
                this.sounds[i].aud.volume = volume;
                this.sounds[i].aud.loop = loop;
            }
        }
    }

    setBgmVolume(name, volume) {
        for (let i = 0; i < this.sounds.length; i++) {
            if (this.sounds[i].name == name) {
                this.sounds[i].aud.volume = volume;
            }
        }
    }

    pause(name) {
        // return false;
        for (let i = 0; i < this.sounds.length; i++) {
            if (this.sounds[i].name == name) {
                
                setTimeout((function(){
                    this.sounds[i].aud.pause();
                }).bind(this),0);

                this.sounds[i].aud.currentTime = 0;
            }
        }
    }

    onTrackEnd(e) {
        let idx = this.getSoundPoolIndex(e.target);
        if (idx == -1) return;
        this.sound_pool.splice(idx, 1);
        // console.log("len",this.sound_pool.length);
    }

    getSoundPoolIndex(audElem) {
        for (let i = 0; i < this.sound_pool.length; i++) {
            if (this.sound_pool[i] == audElem) return i;
        }
        return -1;
    }
}
