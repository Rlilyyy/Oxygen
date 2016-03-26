var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");

mongoose.connect('mongodb://localhost/oxygen');

var db = mongoose.connection;

db.on('error',console.error);

var songSchema = {};
var Song = {};

db.once('open',function(){
    //在这里创建你的模式和模型
    songSchema = mongoose.Schema({
        singer: String,
        title: String,
        url: String,
        lyrics: String,
        image: String
    });

    Song = mongoose.model("Song", songSchema);
    //
    // var song = new Song({
    //     singer: "陈奕迅",
    //     title: "浮夸",
    //     url: "http://7xoehm.com1.z0.glb.clouddn.com/%E9%99%88%E5%A5%95%E8%BF%85%20-%20%E6%B5%AE%E5%A4%B8.mp3",
    //     lyrics: "/lrc/浮夸.lrc",
    //     image: "http://www.52tq.net/uploads/allimg/160324/0R6101206-1.jpg"
    // })
    //
    // var song1 = new Song({
    //     singer: "陈柏霖",
    //     title: "我不会喜欢你",
    //     url: "http://7xoehm.com1.z0.glb.clouddn.com/%E9%99%88%E6%9F%8F%E9%9C%96%20-%20%E6%88%91%E4%B8%8D%E4%BC%9A%E5%96%9C%E6%AC%A2%E4%BD%A0.mp3",
    //     lyrics: "/lrc/我不会喜欢你.lrc",
    //     image: "http://static.meiguoshenpo.com/image/201603/076359295802731100461512850.jpg"
    // })
    //
    // song.save();
    // song1.save();
});

router.post("/insert", function(req, res) {
    var body = req.body;
    console.log(body.singer, body.title, body.url, body.lyrics, body.image)
    if(!body.singer || !body.title || !body.url || !body.lyrics || !body.image) {
        res.sendStatus(200);
        res.end();
        return;
    }
    var song = new Song({
        singer: body.singer,
        title: body.title,
        url: body.url,
        lyrics: body.lyrics,
        image: body.image
    });

    song.save(function(err) {
        if(!err) {
            res.sendStatus(200);
            res.end();
        }else {
            res.sendStatus(500);
            res.end();
        }
    })
})


router.get("/", function(req, res) {
    db.model("Song").find(function(err, songs) {
        res.send(JSON.stringify(songs));
        res.end();
    });
})

// router.param("id", function(req, res, next, id) {
//     console.log(id);
//     next();
// })

router.get("/:id", function(req, res) {

    res.send(req.params.id)
    // res.sendStatus(200);
    res.end();
})

module.exports = router;
