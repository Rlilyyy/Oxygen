define(["backbone"], function(Backbone) {
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
            $("#blur").css("background", "url('" + this.model.get("image") + "') center no-repeat");
            $("#blur").css("backgroundSize", "100%");

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
                        var time = str[0].match(reg);

                        if(!!time) {
                            time = time[0];
                        }else {
                            time = "0"
                        }

                        if(!filterReg.test(time) && time != "0") {
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
                    }
                },
                error: function() {
                    console.log("error");
                }
            })
        }
    });

    return LyricsView;
});
