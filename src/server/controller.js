import Session from './session';
import * as utils from './utils';
import md5 from 'md5';

export default class AppController {

    /**
     * @param {Session} session
     */
    constructor(session) {
        this._router = require('express').Router();
        this.session = session;
    }

    /**
     * @returns {AppController}
     */
    intitialize() {
        this._router.get('/', this.RootGet.bind(this));
        this._router.post('/', this.RootPost.bind(this));
        this._router.get('/world', this.WorldGet.bind(this));
        this._router.get('/room/r/:id', this.PrivateGet.bind(this));
        this._router.get('/server', this.ServerGet.bind(this));
        this._router.post('/disconnect', this.Disconnect.bind(this));
        return this;
    }

    RootGet(req, res, next) {
        res.render('index');
    }

    RootPost(req, res, next) {
        req.session.name = req.body.name;
        this.session.removeUserSession(req.sessionID);
        this.session.addUserSession(req.sessionID, {
            name: req.body.name,
            color: utils.randomColor(),
            elementID: md5(req.sessionID),
        });
        if (req.body.type == 'create') {
            let roomID = this.createRoom();
            console.log(roomID);
            res.redirect(`room/r/${roomID}`);
        } else if (req.body.type == 'join') {
            if (req.body.room == 'world') {
                res.redirect('world');
            } else if (req.body.room == 'private') {
                let roomID = req.body.roomID;
                res.redirect(`room/r/${roomID}`);
            } else {
                this.session.removeUserSession(req.sessionID);
                res.redirect('/');
            }
        } else {
            this.session.removeUserSession(req.sessionID);
            res.redirect('/');
        }
    }
    
    WorldGet(req, res, next) {
        let name = req.session.name;
        if (name) {
            res.render('worldRoom', {
                name: req.session.name
            });
        } else {
            res.redirect('/');
        }
    }

    PrivateGet(req, res, next) {
        console.log("Get called");
        let roomID = req.params.id;
        let name = req.session.name;
        if(!name) {
            res.redirect('/');
        }
        if(this.isValidRoomID(roomID)) {
            console.log("Room valid");
            res.render('privateRoom', {
                name: req.session.name,
                roomID: roomID
            });
        } else {
            console.log("Room invalid");
            res.status(404).send('Invalid room');
        }
    }

    ServerGet(req, res, next) {
        res.render('server');
    }

    Disconnect(req, res, next) {
        delete req.session.name;
        res.redirect('/');
    }

    /**
     * @param {String} roomID 
     * @returns {Boolean}
     */
    isValidRoomID(roomID) {
        let valid = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        return roomID.match(/R[A-za-z0-9]{5}/) != undefined && this.session.getRoom(roomID) != undefined;
    }

    /**
     * @returns {String}
     */
    createRoom() {
        let roomID = '';
        while(this.session.getRoom(roomID = `R${utils.makeid(5)}`)) {
            console.log(roomID);
        }
        this.session.addRoom(roomID);
        return roomID;
    }

    get router() {
        return this._router;
    }
}