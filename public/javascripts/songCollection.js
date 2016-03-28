define(["backbone", "songModel"],
function(Backbone, Song) {

    var SongList = Backbone.Collection.extend({

        model: Song,

        url: "../getSongList"

    });

    // var Song = new SongList();

    return SongList;
})
