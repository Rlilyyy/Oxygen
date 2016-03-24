;$(function() {

    var SongInfoModel = Backbone.Model.extend({
        defaults: function() {
            return {
                "singer": "佚名",
                "title": "Oxygen"
            }
        }
    })

    var LyricsModel = Backbone.Model.extend({
        defaults: function() {
            return {
                "lyrics": []
            }
        }
    })

    var ProgressModel = Backbone.Model.extend({
        defaults: function() {
            return {
                "length": "0",
                "loaded_length": "0",
                "playing_length": "0"
            }
        }
    })

    var Song = Backbone.Model.extend({

        defaults: function() {
            return {
                "songInfo": new SongInfoModel(),
                "lyrics": new LyricsModel(),
                "progress": new ProgressModel(),
                "order": Songs.nextOrder()
            };
        }
    })

    var SongList = Backbone.Collection.extend({

        model: Song,

        nextOrder: function() {
            if(!this.length)    return 1;
            return this.last().get("order") + 1;
        },

        comparator: function() {
            return this.get("order");
        }

    })

    var Songs = new SongList();

    // 歌词 View
    var LyricsView = Backbone.View.extend({

         el: $("#lyrics-ul"),

         initialize: function() {
             this.render();
             this.listenTo(this.model, "change", this.render);
         },

         render: function() {
             var length = this.model.get("lyrics").length;
             this.$el.html("");
             for(var idx=0;idx<length;idx++) {
                 this.$el.append("<li>狼牙月 伊人憔悴</li>")
             }
         }
    })

    var ProgressView = Backbone.View.extend({

        el: $("#progress-bar"),

        initialize: function() {
            this.render();
            this.listenTo(this.model)
        }
    })

    // 歌曲信息 View
    var SongInfoView = Backbone.View.extend({

        titleElem: $("#song-info-name"),
        singerElem: $("#song-info-singer"),

        el: $("#controller-song-info"),

        initialize: function() {
            this.render();
            this.listenTo(this.model, "change", this.render);
        },

        render: function() {
            this.titleElem.html(this.model.get("title"));
            this.singerElem.html(this.model.get("singer"));
        }
    })



    // 控制器 View
    var ControllerView = Backbone.View.extend({

        randomIcon: $("#random"),
        pauseIcon: $("#pause"),
        volIcon: $("#volume-status"),
        volBar: $("#vol-adjust"),
        volCursor: $("#vol-adjust-btn"),

        el: $("#controller-bar"),

        events: {
            "click #random": "random",
            "click #backward": "backward",
            "click #pause": "pause",
            "click #volume-status": "setVolStaus",
            "click #vol-adjust": "prevent"
        },

        initialize: function() {
            Songs.add(new Song());
            var songInfoView = new SongInfoView({model: Songs.at(0).get("songInfo")});
            var lyricsView = new LyricsView({model: Songs.at(0).get("lyrics")});
            var progressView = new ProgressView({model: Songs.at(0).get("progress")});
        },

        random: function() {
            this.randomIcon.toggleClass("randoming");
        },

        backward: function() {

        },

        pause: function() {
            if(this.pauseIcon.hasClass("icon-pause")) {
                this.pauseIcon.addClass("icon-play").removeClass("icon-pause");
            }else {
                this.pauseIcon.addClass("icon-pause").removeClass("icon-play");
            }
        },

        setVolStaus: function() {
            if(this.volIcon.hasClass("icon-volume-up")) {
                this.volIcon.addClass("icon-volume-off").removeClass("icon-volume-up");
                this.setVol(0);
            }else {
                this.volIcon.addClass("icon-volume-up").removeClass("icon-volume-off");
                this.setVol(100);
            }
        },

        setVol: function(bottom) {
            bottom >= 97 ? bottom = 97 :
                (bottom <=0 ? bottom = 0 : bottom = bottom);
            this.volCursor.css("bottom", bottom + "px");
        },

        prevent: function(e) {
            console.log(1)
            e.stopPropagation();
        }
    })

    var controllerView = new ControllerView();
});
