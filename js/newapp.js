;(function($, window, undefined) {

  SC.initialize({
      client_id: "b1ec133b0f33710d7443875249facd57"
  });

  var hot_tracks, widget;

  var greetings = [
    'Listen to some fucking ',
    'Bet you never fucking heard ',
    'Your fucking ears will be graced by ',
    'The fucking Music Gods have brought you ',
    'Muh fucking Mozart is chanelled through ',
    'Your life was fucking incomplete without ',
    'Bro, fucking listen to '
  ];

  function getRandomTrack(aTag) {
    var genre = genres.where({name: aTag});
    var arrayOfTracks = genre[0].attributes.tracks;
    this.randomTrack = arrayOfTracks[Math.floor(arrayOfTracks.length*Math.random())];
    this.whatTag = aTag;
    // Route a URL for this track
    var song = randomTrack.user.permalink + "-" + randomTrack.permalink;
    var link = new Link;
    localStorage[song] = JSON.stringify(randomTrack);
    link.navigate(song);
    return randomTrack;
  }

  function getGreeting() {
    $(".listenToGreeting").html(greetings[Math.floor(greetings.length * Math.random())]);
    var soundCloudUser = this.randomTrack.user.username;
    var soundCloudUserUrl = this.randomTrack.user.permalink_url;
    $(".username a").attr("href",soundCloudUserUrl).html(soundCloudUser);
  }

  function playNextTrack(widget) {
    widget.load(getRandomTrack(this.whatTag).uri, {
      auto_play: true,
      sharing: false
    });
    getGreeting();
  }

  function play(track) {
    var currentTrack = null;
    // SC Playing http://developers.soundcloud.com/docs/api/guide#playing
    // SC oEmbed http://developers.soundcloud.com/docs/api/reference#oembed
    SC.oEmbed(track.uri, {show_comments: false, sharing: false, auto_play: true}, function(oembed) {
      // Embed iframe
      $(".music").html(oembed.html);
      // http://developers.soundcloud.com/docs/api/html5-widget#methods
      widget = SC.Widget($(".music iframe")[0]);
      widget.bind(SC.Widget.Events.READY, function (e) {
        $(".username").css("visibility", "visible");
        $("nav").css("visibility", "visible");
        $(".next").click(function() {
          playNextTrack(widget);
        });
        playPause();
        widget.bind(SC.Widget.Events.FINISH, function () {
          playNextTrack(widget);
        });
      });
    });
  }

  function playPause() {
    // PLAY/PAUSE ANIMATION and KEYBOARD/SPACEBAR STROKE
    $(document).keypress(function(e) {
      //If spacebar (32) is pressed, togglePlay and return false
      if ((e.which && e.which == 32) || (e.keyCode && e.keyCode == 32)) {
        togglePlay();
        return false;
      } else {
        return true;
      }
    });

    $('#playButton').click(function(){
      togglePlay();
      return false;
    });
  }

  function togglePlay(){
    var $elem = $('#player').children(':first');
    $elem.stop()
      .show()
      .animate({
        marginTop: -175,
        marginLeft: -175,
        width: 350,
        height: 350,
        opacity: 0
      }, function() {
        $(this).css({
          width:'100px',
          height:'100px',
          "margin-left":'-50px',
          "margin-top":'-50px',
          opacity: 1,
          display:'none'
      });
    });
    $elem.parent().append($elem);
    if ( $("#player").children(":first").attr("id") == "pause" ) {
      widget.pause();
      $("#playButton").html("&nbsp; &#9658; &nbsp;");
    } else {
      widget.play();
      $("#playButton").html("&nbsp;&#9616;&#9616;&nbsp;");
    }
  }

  // Model that contains all genres
  var Track = Backbone.Model.extend({
    link: null,
    title: null,
    onChange: function() {
      // Update Social Links
    },
    onLeave: function() {
      //Save track and last played spot in track
    }
  });
  var Genre = Backbone.Model.extend({});
  var Genres = Backbone.Collection.extend({});
 
  var genres = new Genres(); 

  var countCheck = 0;
  var tagCount = $("#selectATag option").length;

  function getTrack(tag) {
    if (tag === "HotTracks") {
      SC.get("/tracks?filter=public&order=hotness", {limit: 50}, function(tracks) {
        //containsUris[tag] = tracks;
        var genre = new Genre({name: tag, tracks: tracks});
        genres.add(genre);
        counts();
      });
    } else {
      SC.get("/tracks?filter=public&order=hotness&tags=" + tag, {limit: 50}, function(tracks) {
        var genre = new Genre({name: tag, tracks: tracks});
        genres.add(genre);
        counts();
      });
    }
  }

  function counts() {
    // Count tracks
    countCheck++;
    if( countCheck < tagCount ) {
    } else if ( link.length > 0 ) {
        console.log("It's true!");
        play(this.track);
      }
      else {
      console.log(genres.length);
      play(getRandomTrack("HotTracks"));
      getGreeting();
    }
  }

  // For each dropdown value, pull 50 tracks
  function allTags() {
    $("#selectATag option").each( function() {
      getTrack($(this).val());
    });
  };

  // Do this everytime you change tags
  $("#selectATag").change( function() {
    widget.load(getRandomTrack($(this).val()).uri, {
      auto_play: true,
      sharing: false,
      show_comments: false
    });
    getGreeting();
  });

  var Link = Backbone.Router.extend({
    routes: {
      "*song":        "loadSong"        // #/*song
    },

    loadSong: function( song ) {
      // Get song
      console.log("Get " + song);
      if ( song.length > 0 ) {
        var track = JSON.parse(localStorage[song]);
        play(track);
      } else {
        allTags();
        }
      // Set social sharing links for song      
    } 
  });

  var link = new Link;

  Backbone.history.start();

  //Create User model
  var user = Backbone.Model.extend({
    
    ip: function() {
      //gets user IP address and identifies if user is new
    },    

    isnew: " " //true or false

  });

  var track = new Track();

})(jQuery, window);
