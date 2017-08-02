class AudioPlayer {
  constructor() {
    this.sounds = [];
    this.players = [];
    
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.context = new AudioContext();
    this.gain_node = this.context.createGain();    
  }

  unlock() {
    alert('unlock');

    var buffer = this.context.createBuffer(1, 1, 22050);
    var source = this.context.createBufferSource();
	  source.buffer = buffer;

    source.connect(this.context.destination);
  	source.start(0);
  }

  initPlayer(files = [], callback = () => {}) {
    var sound_loader_1 = this.loadSound(files[0], 'start');
    var sound_loader_2 = this.loadSound(files[1], 'loop');

    Promise.all([sound_loader_1, sound_loader_2]).then(callback);
  }

  loadSound(url, buffer_name) {
    let request = new XMLHttpRequest();

    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    return new Promise((resolve, reject) => {
      request.onreadystatechange = () => {
        if (request.readyState != 4) return;

        if (request.status == 200) {
          this.context.decodeAudioData(request.response, (data) => {
            this.sounds[buffer_name] = data;
          
            resolve();  
          });
        } else {
          console.log('Unable to load audio file ' + url);        
          resolve();  
        }
      };

      request.send();
    });
  }

  setupSound(name, loop = false) {
    this.players[name] = this.context.createBufferSource();
    this.players[name].buffer = this.sounds[name];
    this.players[name].connect(this.gain_node);
    this.players[name].loop = loop;

    this.gain_node.connect(this.context.destination);
    this.gain_node.gain.value = 0.5;
  }

  initPlay() {
    setTimeout(() => {
      this.players['loop'].start(0);
    }, 9651);

    this.setupSound('start', false);
    this.setupSound('loop', true);

    this.players['start'].start(0);
  }

  play() {
    this.gain_node.gain.value = 0.5;
  }

  pause() {
    this.gain_node.gain.value = 0;
  }
}