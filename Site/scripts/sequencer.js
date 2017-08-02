class Sequencer {
  constructor(segments = {}, configuration = {}) {
    this.segments = segments;
    this.configuration = configuration;
    this.is_playing = false
    this._filter = 1;

    this.buffer_sfx = fx.canvas();
    this.buffer_draw = this.configuration.canvas
    this.buffer_draw_context = this.buffer_draw.getContext('2d');

    this.current_frame = this.configuration.from - 1;
    this.interval_ID;

    this.image_interlace = new Image();
    this.image_interlace.src = './medias/interface/scanlines.png';

    this.setSize(window.innerWidth, window.innerHeight);
  }

  set filter(filter = 1) {
    if (filter > 4) filter = 1;
    this._filter = filter;
  }

  get filter () {
    return this._filter;
  }

  run() {
    this.is_playing = true;

    this.interval_ID = setInterval(() => {
      this.current_frame += 1;
      if (this.current_frame > this.configuration.to) this.current_frame = this.configuration.from;

      this.nextImage();
    }, 40);
  }

  stop() {
    this.is_playing = false;
  	clearInterval(this.interval_ID);
  }

  skipTo(index) {
  	this.current_frame = index;
    this.nextImage();
  }

  getImageUrl() {
    var last_segment_end = 0;

    for (var i = 0; i < this.segments.length; i++) {
      if (this.current_frame < last_segment_end + this.segments[i].count) {
        return this.segments[i].folder_name + '/' + (this.current_frame - last_segment_end) + '.jpg';
      }

      last_segment_end += this.segments[i].count;
    }
  }

  nextImage() {
    var image = new Image();
    image.src = this.configuration.basedir + this.getImageUrl();

    image.onload = () => {
      this.fps_time = this.drawImage(image);
    }
  }

  drawImage(img) {
    if (img == undefined) return;

    var startTime = 0, endTime = 0;
    startTime = performance.now() || new Date().getTime();

    var canvas_ratio = this.buffer_draw.width / this.buffer_draw.height;
    var image_ratio = img.width / img.height;
    var image_width, image_height;

    if (canvas_ratio > image_ratio) {
      image_width = this.buffer_draw.width;
      image_height = image_width / image_ratio;
    } else {
      image_height = this.buffer_draw.height;
      image_width = image_height * image_ratio;
    }

    var left = this.buffer_draw.width / 2 - image_width / 2;
    var top = this.buffer_draw.height / 2 - image_height / 2;

    var texture = this.buffer_sfx.texture(img);
    this.buffer_sfx.draw(texture);

    this.pre_filter();

    this.buffer_sfx.update();

    this.buffer_draw_context.clearRect(0, 0, this.buffer_draw.width, this.buffer_draw.height);
    this.buffer_draw_context.drawImage(this.buffer_sfx, 0, 0, this.buffer_sfx.width, this.buffer_sfx.height, ~~left, ~~top, ~~image_width, ~~image_height);

    this.post_filter();

    endTime = performance.now() || new Date().getTime();

    return endTime - startTime;
  }

  pre_filter() {
    switch (this._filter) {
      case 1:
        this.buffer_sfx.brightnessContrast(0.0, 0.25);
        this.buffer_sfx.vibrance(-1);
        this.buffer_sfx.zoomBlur(this.buffer_sfx.width / 2, this.buffer_sfx.height / 2, .1);
        this.buffer_sfx.vignette(.5, .55);
        this.buffer_sfx.noise(.05);
        break;
      case 2:
        this.buffer_sfx.brightnessContrast(0.1, 0);
        this.buffer_sfx.vibrance(1);
        this.buffer_sfx.zoomBlur(this.buffer_sfx.width / 2, this.buffer_sfx.height / 2, 0.1);
        this.buffer_sfx.vignette(.5, .55);
        this.buffer_sfx.noise(.05);
        break
      case 3:
        this.buffer_sfx.hueSaturation(0, -1);
        this.buffer_sfx.brightnessContrast(0, 0.5);
        this.buffer_sfx.zoomBlur(this.buffer_sfx.width / 2, this.buffer_sfx.height / 2, 0.1);
        this.buffer_sfx.vignette(.5, .55);
        this.buffer_sfx.noise(.05);
        break
      case 9:
        this.buffer_sfx.dotScreen(0, 0, 1.1, .5);
        break;
    }
  }

  post_filter() {
    switch (this._filter) {
      case 1:
        this.buffer_draw_context.globalCompositeOperation = "soft-light";
        this.buffer_draw_context.fillStyle="rgba(255, 200, 0, .1)";
        this.buffer_draw_context.fillRect(0, 0, this.buffer_draw.width, this.buffer_draw.height);
        this.buffer_draw_context.drawImage(this.image_interlace, 0, 0, this.image_interlace.width, this.image_interlace.height, 0, 0, this.image_interlace.width, this.image_interlace.height);
      break;
    }
  }

  setSize(width, height) {
    this.buffer_draw.width = width;
    this.buffer_draw.height = height;
    this.buffer_draw.style.width = width + 'px';
    this.buffer_draw.style.height = height + 'px';

    this.drawImage();
  }
}
