var router = require('express').Router();

router.get('/', function (req, res) {
    res.render('index');
});

router.post('/', function(req, res) {
    // set cookie
    // if POST invalid, redirect with rendered errors
    // if room == world, redirect to world/
    // if room == id, check room, redirect to room/ with custom url
    console.log(req.body);
    res.send(req.body);
});

router.get('/world', function(req, res) {
    // if cookie exists, enter room
    // if not, kick from room and redirect to /
    res.render('worldRoom');
});

router.get('/room/r/:id(R[A_Za-z0-9]{5})', function(req, res) {
    // if cookie exists, enter room
    // if room invalid, kick from room and redirect to /
    // if not, kick from room and redirect to /
    res.render('privateRoom');
});

router.post('/disconnect', function(req, res) {
    // clear cookie
    // redirect to index
    console.log(req.body);
    res.send(req.body);
});

router.get('/room/r/:roomid', function(req, res) {
    // if cookie exists, enter room
    // if not, kick from room and redirect to /
});

module.exports = router;