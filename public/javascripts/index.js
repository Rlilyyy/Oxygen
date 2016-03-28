require.config({
    paths: {
        jquery: "jquery-2.2.2",
        underscore: "underscore",
        backbone: "backbone",
        songModel: "songModel",
        songCollection: "songCollection",
        lyricsView: "lyricsView",
        songInfoView: "songInfoView",
        app: "app"
    }
});

require(["app"], function(app) {
    // var app = new app();
});
