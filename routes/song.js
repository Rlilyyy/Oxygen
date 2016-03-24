var express = require("express");
var router = express.Router();
var mongodb = require("mongodb");

var server = new mongodb.Server("localhost", 27017, {auto_reconnect:true});
var db = new mongodb.Db('oxygen', server, {safe:true});

db.open(function(err, db) {
    if(err) {
        console.log("err");
    }else {
        console.log("OK");
    }
})

router.get("/", function(req, res) {
    console.log("a");
    res.send("iugfd")
    res.end();
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
