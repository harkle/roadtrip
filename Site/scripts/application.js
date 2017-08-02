class Application {
  constructor() {
    this.segments = [];
    this.places = [];
    this.configuration = {};
    this.audio_player = new AudioPlayer();
  }

  loadConfiguration() {
    $.getJSON('./data/configuration.json', (json) => {
      this.configuration = json;
    }).then(() => {
      return $.getJSON(this.configuration.segments_file, (json) => {
        this.segments = json;
      })
    }).then(() => {
      return $.getJSON(this.configuration.places_file, (json) => {
        $.each(json.points, (index, item) => {
          if (!item.start) item.start = this.getSegmentStartFrame(item.start_segment);
        });

        $.each(json.areas, (index, item) => {
          if (!item.start) item.start = this.getSegmentStartFrame(item.start_segment);
          if (!item.end) item.end = this.getSegmentStartFrame(item.end_segment);
        });

        this.places = json;
        this.initApplication();
      });
    });
  }

  initApplication() {
    // Create interface
    this.computeLocations();

    // Add events handlers
    this.bindsEvents();

    // Create a sequencer
    this.sequencer = new Sequencer(this.segments, {
	    canvas: $('canvas').get(0),
      from: 1,
      to: this.configuration.max_frames,
      basedir: this.configuration.basedir
	  });

    // Create audio player    
    this.audio_player.initPlayer(this.configuration.audio, () => {
      $('.sk-fading-circle').remove();
      $('body').addClass('fade_in');

      setTimeout(() => {
        $('body').removeClass('fade_in').addClass('active');
      }, 9000);

      this.sequencer.run();
      this.audio_player.initPlay();
    });

    // Create the cursor
    $('#cursor').draggable({
      axis: 'x',
      containment: "parent"
    });

    // Distance counter refresh
    setInterval(() => {
      $('#cursor').css('left', this.sequencer.current_frame * ($('#track').width() - 10) / this.configuration.max_frames + 'px');
      $('#counter').text((this.sequencer.current_frame * 10 / 1000).toFixed(1) + ' km');
    }, 1000);
  }

  computeLocations() {
    $.each(this.places.points, (index) => {
      var html_tag = $('<div data-index="' + index + '"><div class="text">' + this.places.points[index].name + '</div></div>').addClass('city');
      if (this.places.points[index].className) html_tag.addClass(this.places.points[index].className);

      html_tag.css({
        left: 'calc(' + (this.places.points[index].start * 100 / this.configuration.max_frames) + '% - 3px)',
      });

      $('#places').append(html_tag);
    });

    $.each(this.places.areas, (index) => {
      var html_tag = $('<div data-index="' + index + '"><div class="text">' + this.places.areas[index].name + '</div></div>').addClass('place');
      if (this.places.areas[index].className) html_tag.addClass(this.places.areas[index].className);
      if (this.places.areas[index].position == 'bottom') html_tag.addClass('bottom');

      var size = this.places.areas[index].end - this.places.areas[index].start;
      html_tag.css({
        left: (this.places.areas[index].start * 100 / this.configuration.max_frames) + '%',
        width: (size * 100 / this.configuration.max_frames) + '%'
      });

      $('#places').append(html_tag);
    });
  }

  bindsEvents() {
    // Pause
    $(window).on('keydown', (event) => {
    	if(event.originalEvent.keyCode == 32) {
        if (this.sequencer.is_playing) {
          this.audio_player.pause();
          this.sequencer.stop();
        } else {
          this.audio_player.play();
          this.sequencer.stop();
          this.sequencer.run();
        }
      }
    });

    // Click on track
    $('#track').on('click', (event) => {
    	var position = event.originalEvent.layerX;
      if (position > ($('#track').width() - 10)) position = ($('#track').width() - 10);

      var destination_frame = parseInt(position * this.configuration.max_frames / ($('#track').width() - 10));
      this.skipTo(destination_frame);
    });

    // Click on points and places
    $('.city, .place').on('click', (event) => {
      event.stopPropagation();
    	var index = $(event.currentTarget).data('index');

      var element = ($(event.currentTarget).hasClass('city')) ? this.places.points[index] : this.places.areas[index];
      this.skipTo(element.start, element.name);
    });

    // Toggle about
    $('#about_button').on('click', (event) => {
      event.preventDefault();

      $('#about').toggleClass('active');
      $('#track').toggleClass('hidden');
    });

    // Toggle filters
    $('#filters_button').on('click', (event) => {
      event.preventDefault();

      var current_filter = this.sequencer.filter + 1;
      if (current_filter > 4) current_filter = 1;
      this.sequencer.filter = current_filter;
    });

    // Manage window focus / blur
    $(window).focus(() => {
      this.audio_player.play();
      this.sequencer.stop();
      this.sequencer.run();
    }).blur(() => {
      this.audio_player.pause();
      this.sequencer.stop();
    });

    // Window resizing
    window.addEventListener('resize', () => {
		  this.sequencer.setSize(window.innerWidth, window.innerHeight);
    });

    // Cursors events
    $('#cursor').on('start', () => {
        this.sequencer.stop();
    });

    $('#cursor').on('drag', (event, ui) => {
      var destination_frame = parseInt(ui.position.left * this.configuration.max_frames / ($('#track').width() - 10));
      this.skipTo(destination_frame, '', false);
    });

    $('#cursor').on('stop', (event, ui) => {
      this.sequencer.run();
    });
  }

  skipTo(destination_frame, name = '', animated = true) {
    if (animated) {
      $('canvas').addClass('fade_inout');
      setTimeout(() => {
        this.sequencer.skipTo(destination_frame)
      }, 1500);

      setTimeout(() => {
        $('canvas').removeClass('fade_inout');
      }, 3000)
    } else {
      this.sequencer.skipTo(destination_frame)
    }
  }

  getSegmentStartFrame(index) {
    var start_frame = 0;

    for (var i = 0; i < index; i++) {
      start_frame += this.segments[i].count;
    }

    return start_frame;
  }

  isMobileOperatingSystem() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
    if (/windows phone/i.test(userAgent)) {
      return "Windows Phone";
    }
  
    if (/android/i.test(userAgent)) {
      return "Android";
    }
  
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return "iOS";
    }
  
    return false;
  }
}

$(function () {
	$('#old_browser').remove();
	var application = new Application();

  if (application.isMobileOperatingSystem()) {
    $('#play_experiment').on('click', function () {

      $('#play_experiment').remove();
      $('.sk-fading-circle').removeClass('hidden');
      application.audio_player.unlock()
      application.loadConfiguration();
    });
  } else {
    $('.sk-fading-circle').removeClass('hidden');
    $('#play_experiment').remove();
    application.loadConfiguration();
  }
});
