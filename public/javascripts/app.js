define(["backbone", "songCollection", "lyricsView", "songInfoView"],
function(Backbone, SongList, LyricsView, SongInfoView) {
    var version = "0.0.9";

    var Songs = new SongList();

    // 歌词 View

    var ProgressView = Backbone.View.extend({

        audio: $("#oxygen")[0],
        progressWidth: parseInt($("#progress-bar-all").css("width")),

        t: 0,

        el: $("#progress-bar"),

        events: {
            "click #progress-bar-all": "changeProgress"
        },

        initialize: function() {
            this.render();
            this.listenToOnce(this.model, "change:fullTime", this.renderTime);
            this.listenTo(this.model, "change:second", this.renderPlayingTime);
        },

        render: function() {
            $("#oxygen").attr("src", this.model.get("url"));
        },

        renderTime: function() {
            var minute = this.model.get("minute");
            var second = this.model.get("second");
            $("#progress-start").html((minute<10?"0"+minute:minute) + ":" + (second<10?"0"+second:second));
            this.renderPlayingTime();
            // this.refreshTime();
        },

        renderPlayingTime: function() {
            var minute = this.model.get("minute");
            var second = this.model.get("second");
            $("#progress-end").html((minute<10?"0"+minute:minute) + ":" + (second<10?"0"+second:second));
        },

        refreshTime: function() {
            var that = this;
            this.t = setTimeout(function() {
                // var minute = that.model.get("minute");
                // var second = that.model.get("second");

                var currentTime = $("#oxygen")[0].duration - $("#oxygen")[0].currentTime;
                var minute = Math.floor(currentTime/60);
                var second = Math.ceil((currentTime / 60.0 - minute) * 60);

                if(second === 0 && minute !== 0) {
                    second = 59;
                    --minute;
                }else if(second === 0 && minute === 0) {
                    second = 0;
                    minute = 0;
                }else {
                    --second;
                }

                var fullTime = that.model.get("fullTime");

                that.refreshProgress(1 - (minute * 60 + second) / fullTime)

                that.t = setTimeout(arguments.callee, 1000);

                !!minute ? minute = minute : minute = 0;
                !!second ? second = second : second = 0;

                that.model.set({
                    "minute": minute,
                    "second": second,
                    "timeoutNum": that.t
                });

            }, 1);
            this.model.set({
                "timeoutNum": this.t
            });
        },

        refreshProgress: function(persent) {
            if(!(this.model == controllerView.currentModel()))    return;
            $("#progress-bar-playing").css("width", (persent * this.progressWidth) + "px");
        },

        refreshCurrentTime: function(persent) {

            var newTime = this.model.get("fullTime") * persent;
            var playingTime = this.model.get("fullTime") - newTime;
            var minute = Math.floor(playingTime/60);
            var second = Math.ceil((playingTime / 60.0 - minute) * 60);

            this.model.set({
                "minute": minute,
                "second": second
            })

            clearTimeout(this.model.get("timeoutNum"));
            controllerView.pause();
            this.audio.currentTime  = newTime;
        },

        changeProgress: function(e) {
            e.stopPropagation();
            this.refreshProgress(e.offsetX / this.progressWidth);
            this.refreshCurrentTime(e.offsetX / this.progressWidth)
        }
    })



    // 控制器 View
    var ControllerView = Backbone.View.extend({

        randomIcon: $("#random"),
        pauseIcon: $("#pause"),
        volIcon: $("#volume-status"),
        volBar: $("#vol-adjust"),
        volCursor: $("#vol-adjust-btn"),
        audio: $("#oxygen")[0],
        volBtn: $("#vol-adjust-btn"),
        vol: {
            begin: 100,
            current: 0,
            flag: false
        },

        index: 0,
        isInit: true,

        el: $(document),
        currentModel: function() {
            return Songs.at(this.index);
        },

        events: {
            "click #random": "random",
            "click #backward": "backward",
            "click #forward": "forward",
            "click #pause": "changeAudioStatus",
            "click #volume-status": "setVolStaus",
            "click #vol-adjust": "stopPropagation",
            "mousedown #vol-adjust-btn": "mousedown",
            "mousemove #container": "mousemove",
            "mouseup #container": "mouseup",
            "click #vol-adjust-bar": "setVolByClick",
            "click #vol-adjust-btn": "stopPropagation",
        },

        initialize: function() {
            this.listenTo(Songs, "add", this.render);
            Songs.fetch();
        },

        render: function() {
            if(this.isInit) {
                this.renderAllView(0);
            }else {
                return;
            }
            this.isInit = false;
        },

        // 更新所有 View
        renderAllView: function(index) {
            this.songInfoView = new SongInfoView({model: Songs.at(index)});
            this.lyricsView = new LyricsView({model: Songs.at(index)});
            this.progressView = new ProgressView({model: Songs.at(index)});
        },

        // 控制相关
        // 单曲循环
        random: function() {
            this.randomIcon.toggleClass("randoming");
            this.audio.loop = !this.audio.loop;
        },

        // 前一首
        backward: function() {
            if(this.index === 0) return;
            clearTimeout(this.currentModel().get("timeoutNum"));
            this.renderAllView(--this.index);
            this.play();
        },

        // 下一首
        forward: function() {
            if(this.index === Songs.length - 1) return;
            clearTimeout(this.currentModel().get("timeoutNum"));
            this.renderAllView(++this.index);
            this.play();
        },

        // 停止与播放
        changeAudioStatus: function() {
            if(this.pauseIcon.hasClass("icon-pause")) {
                this.pause();
            }else {
                this.play();
            }
        },

        play: function() {
            this.pauseIcon.addClass("icon-pause").removeClass("icon-play");
            this.audio.play();
            this.progressView.refreshTime();
        },

        pause: function() {
            this.pauseIcon.addClass("icon-play").removeClass("icon-pause");
            this.audio.pause();
            clearTimeout(this.currentModel().get("timeoutNum"));
        },

        // 音量相关
        // 拖动音量条
        mousedown: function(e) {
            this.vol["flag"] = true;
            this.vol["begin"] = e.clientY;
            this.vol["current"] = parseInt(this.volCursor.css("bottom")) + 3;
            this.volBar.css("display", "block");
        },

        mousemove: function(e) {
            if(this.vol["flag"]) {
                this.setVol(this.vol["begin"] - e.clientY + this.vol["current"])
            }
        },

        mouseup: function(e) {
            e.stopPropagation();
            this.vol["flag"] = false;
            this.volBar.css("display", "");
        },

        // 点击设置音量
        setVolByClick: function(e) {
            this.setVol(this.volBtn[0].offsetTop - e.offsetY +
                parseInt(this.volCursor.css("bottom")) + 3 + 6);
        },

        // 设置静音
        setVolStaus: function(e) {
            if(this.volIcon.hasClass("icon-volume-up")) {
                this.volIcon.addClass("icon-volume-off").removeClass("icon-volume-up");
                this.setVol(0);
            }else {
                this.volIcon.addClass("icon-volume-up").removeClass("icon-volume-off");
                this.setVol(100);
            }
        },

        // 设置音量和音量条
        setVol: function(bottom) {
            bottom >= 100 ? bottom = 100 :
                (bottom <=0 ? bottom = 0 : bottom = bottom);
            this.volCursor.css("bottom", bottom-3 + "px");
            this.audio.volume = bottom / 100.0;

            if(this.audio.volume > 0 && this.audio.volume*100 <= 50) {
                this.volIcon.addClass("icon-volume-down");
                this.volIcon.removeClass("icon-volume-up");
                this.volIcon.removeClass("icon-volume-off");
            }else if(this.audio.volume*100 > 50) {
                this.volIcon.addClass("icon-volume-up");
                this.volIcon.removeClass("icon-volume-down");
                this.volIcon.removeClass("icon-volume-off");
            }else if(this.audio.volume === 0) {
                this.volIcon.addClass("icon-volume-off");
                this.volIcon.removeClass("icon-volume-down");
                this.volIcon.removeClass("icon-volume-up");
            }
        },

        stopPropagation: function(e) {
            e.stopPropagation();
        }
    })

    var controllerView = new ControllerView();

    // 歌曲搜索结束
    $("#oxygen")[0].addEventListener("seeked", function() {
        controllerView.play();
    }, false);

    // 歌曲可以开始播放
    $("#oxygen")[0].addEventListener("canplay", function() {
        var duration = this.duration;
        var minute = Math.floor(duration/60);
        var second = Math.floor((duration / 60.0 - minute) * 60);

        controllerView.currentModel().set({
            "minute": minute,
            "second": second,
            "fullTime": duration + Math.random()
        });
        // controllerView.play();
    }, false);

    // 歌曲结束
    $("#oxygen")[0].addEventListener("ended", function() {
        controllerView.pause();
        if(this.loop)   return;
        controllerView.forward();
        index = 0;
        $("#lyrics-ul").css("transform","translateY(" + -28*index + "px)");
    }, false);

    var index = 0;

    // 歌词同步
    $("#oxygen")[0].addEventListener("timeupdate", function() {
        while(!!$("#lyrics-ul li")[5+index] && this.currentTime > controllerView.lyricsView.lyricsArr[index]) {
            $("#lyrics-ul").css("transform","translateY(" + -28*index + "px)");
            $("#lyrics-ul li")[3+index].className = ""
            $("#lyrics-ul li")[4+index].className = "current-lyrics"
            index++
        }

        while(!!$("#lyrics-ul li")[4+index] && this.currentTime < controllerView.lyricsView.lyricsArr[index-1]) {
            $("#lyrics-ul li")[4+index].className = ""
            index--;
            $("#lyrics-ul li")[4+index].className = "current-lyrics"
            $("#lyrics-ul").css("transform","translateY(" + -28*index + "px)");
        }
    }, false);

    return {
        constructor: ControllerView,
        app: controllerView
    };
})
