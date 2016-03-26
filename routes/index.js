var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
    res.render("index");
});

router.get("/index", function(req, res) {
    res.render("index");
});

router.get("/insert", function(req, res) {
    res.render("insertSong");
})

module.exports = router;
