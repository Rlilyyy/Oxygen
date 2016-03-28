define(["backbone"], function(Backbone) {
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
                "timeoutNum": 0
            };
        }
    });

    return Song;
});
