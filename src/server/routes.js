var router = require('express').Router();

router.get('/', function (req, res) {
    res.render('index', {
        "name": "World!"
    });
});

router.post('/', function(req, res) {
    // set cookie
    // if POST invalid, redirect with rendered errors
    // if room == global, redirect to global/
    // if room == id, check room, redirect to room/ with custom url
    console.log(req.body);
    res.send(req.body);
});

router.get('/world', function(req, res) {
    // if cookie exists, enter room
    // if not, kick from room and redirect to /
});

router.get('/room/r/:roomid', function(req, res) {
    // if cookie exists, enter room
    // if not, kick from room and redirect to /
});

module.exports = router;