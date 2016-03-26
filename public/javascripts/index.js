;$(function() {

    var Song = Backbone.Model.extend({

        defaults: function() {
            return {
                "singer": "佚名",
                "title": "Oxygen",
                "lyrics": "",
                "fullTime": 0,
                "minute": 0,
                "secong": 0,
                "loaded_length": "0",
                "playing_length": "0",
                "timeoutNum": 0,
                "order": Songs.nextOrder()
            };
        }
    })

    var SongList = Backbone.Collection.extend({

        model: Song,

        url: "../getSongList",

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

        ul: $("#lyrics-ul"),

        el: $("#preview-container"),

        lyricsArr: {},

        initialize: function() {
            this.render();
        },

        render: function() {
            // var length = this.model.get("lyrics").length;
            var url = this.model.get("lyrics");
            this.ul.html("");
            this.$el.css("background", "url('" + this.model.get("image") + "') center no-repeat");
            this.$el.css("backgroundSize", "100%");

            if(url.length <= 0)
                return;

            var that = this;

            $.ajax({
                url: url,
                type: "GET",
                success: function(data) {
                    var lyricsArr = data.split("\n");
                    var len = lyricsArr.length;
                    var reg = /[^\[](\S*)/g;
                    var filterReg = /[A-Za-z]/;

                    for(var i=0;i<4;i++) {
                        that.ul.append("<li></li>")
                    }

                    var idx = 0;

                    for(var i=0;i<len;i++) {
                        var str = lyricsArr[i].split("]")
                        var lyrics = str[1];
                        var time = str[0].match(reg)[0];

                        if(!filterReg.test(time)) {

                            var timeArr = time.split(":");
                            var min = parseInt(timeArr[0]);
                            var sec = parseInt(timeArr[1].split(".")[0]);
                            var mill = parseInt(timeArr[1].split(".")[1]);


                            if(idx === 0) {
                                that.ul.append("<li class=\"current-lyrics\">" + lyrics +"</li>");
                                first = false;
                            }else {
                                that.ul.append("<li>" + lyrics +"</li>");
                            }
                            that.lyricsArr[idx++] = min * 60 + sec;

                        }
                        // console.log(matchStr, str[1])
                    }
                    console.log(that.lyricsArr)
                },
                error: function() {
                    console.log("error");
                }
            })
        }
    })

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
            $("#progress-start").html(this.model.get("minute") + ":" + this.model.get("second"));
            this.renderPlayingTime();
            // this.refreshTime();
        },

        renderPlayingTime: function() {
            $("#progress-end").html(this.model.get("minute") + ":" + this.model.get("second"));
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

    // 歌曲信息 View
    var SongInfoView = Backbone.View.extend({

        titleElem: $("#song-info-name"),
        singerElem: $("#song-info-singer"),

        el: $("#controller-song-info"),

        initialize: function() {
            this.render();
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
    }, false);

    var index = 0;

    // 歌词同步
    $("#oxygen")[0].addEventListener("timeupdate", function() {
        while(!!controllerView.lyricsView.lyricsArr[index+1] && this.currentTime > controllerView.lyricsView.lyricsArr[index]) {
            $("#lyrics-ul").css("transform","translateY(" + -28*index + "px)");
            $("#lyrics-ul li")[3+index].className = ""
            $("#lyrics-ul li")[4+index].className = "current-lyrics"
            index++
        }

        while(!!controllerView.lyricsView.lyricsArr[index] && this.currentTime < controllerView.lyricsView.lyricsArr[index-1]) {
            $("#lyrics-ul li")[4+index].className = ""
            index--;
            $("#lyrics-ul li")[4+index].className = "current-lyrics"
            $("#lyrics-ul").css("transform","translateY(" + -28*index + "px)");
        }
    }, false);
});
