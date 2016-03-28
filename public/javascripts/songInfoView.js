define(["backbone"], function(Backbone) {
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

    return SongInfoView;
})
