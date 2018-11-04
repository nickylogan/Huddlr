import Storage from './storage';
import * as utils from '../utils';
import * as events from '../events';
import md5 from 'md5';
import ip from 'ip';

export default class AppController {

    /**
     * @param {Storage} storage
     */
    constructor(storage, port) {
        this._router = require('express').Router();
        this.storage = storage;
        this.port = port;
    }

    /**
     * @returns {AppController}
     */
    intitialize() {
        this._router.get('/', this.RootGet.bind(this));
        this._router.post('/', this.RootPost.bind(this));
        this._router.get('/world', this.WorldGet.bind(this));
        this._router.get('/world/files/:fileName', this.Download.bind(this));
        this._router.get('/room/r/:id', this.PrivateGet.bind(this));
        this._router.get('/room/r/:id/files/:fileName', this.Download.bind(this));
        this._router.get('/server', this.ServerGet.bind(this));
        this._router.post('/disconnect', this.Disconnect.bind(this));
        return this;
    }

    RootGet(req, res, next) {
        res.render('index');
    }

    RootPost(req, res, next) {
        req.session.name = req.body.name;
        this.storage.removeUserSession(req.sessionID);
        this.storage.addUserSession(req.sessionID, {
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
                this.storage.removeUserSession(req.sessionID);
                res.redirect('/');
            }
        } else {
            this.storage.removeUserSession(req.sessionID);
            res.redirect('/');
        }
    }

    WorldGet(req, res, next) {
        let name = req.session.name;
        if (name) {
            let users = this.storage.getUsersInRoomExcept('world', req.sessionID);
            // console.log("####");
            console.log(users);
            // console.log("####");
            res.render('worldRoom', {
                name: req.session.name,
                users: users,
            });
        } else {
            res.redirect('/');
        }
    }

    PrivateGet(req, res, next) {
        console.log("Get called");
        let roomID = req.params.id;
        let name = req.session.name;
        if (!name) {
            res.redirect('/');
        }
        if (this.isValidRoomID(roomID)) {
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
        let elements = this.storage.logs().map(log => this.getLogElement(log));
        res.render('server', {
            logs: elements,
            ip: ip.address('private', 'ipv4'),
            port: this.port,
        });
    }

    Disconnect(req, res, next) {
        this.storage.removeUserSession(req.sessionID);
        res.redirect('/');
    }

    Download(req, res, next) {
        let fileName = req.params.fileName;
        let file = __dirname + `/../../upload/${fileName}`;
        res.download(file);
    }

    /**
     * @param {String} roomID 
     * @returns {Boolean}
     */
    isValidRoomID(roomID) {
        let valid = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        return roomID.match(/R[A-za-z0-9]{5}/) != undefined && this.storage.getRoom(roomID) != undefined;
    }

    /**
     * @returns {String}
     */
    createRoom() {
        let roomID = '';
        while (this.storage.getRoom(roomID = `R${utils.makeid(5)}`)) {
            console.log(roomID);
        }
        this.storage.addRoom(roomID);
        return roomID;
    }

    /**
     * @param {Object} log
     * @param {String} log.time
     * @param {String} log.type
     * @param {String} log.user
     * @param {String} log.message
     * @param {String} log.room
     */
    getLogElement(log) {
        let time = log.time;
        let content = '';
        switch (log.type) {
            case events.SERVER_CONNECT:
                content = `<span class="text-primary">&lt;&lt;ROOM:${log.room}&gt;&gt;</span> <span class="text-warning">${log.user}</span> has <span class="text-success">connected</span>`;
                break;
            case events.SERVER_DISCONNECT:
                content = `<span class="text-primary">&lt;&lt;ROOM:${log.room}&gt;&gt;</span> <span class="text-warning">${log.user}</span> has <span class="text-danger">disconnected</span>`;
                break;
            case events.SERVER_CHAT:
                content = `<span class="text-primary">&lt;&lt;ROOM:${log.room}&gt;&gt;</span> <span class="text-warning">${log.user}</span> sent message <span class="text-info">"${log.message}"</span>`;
                break;
            default:
                content = `asdf`
                break;
        }
        let el = `<li><span class="text-secondary">${time} </span>${content}</li>`;
        return el;
    }

    get router() {
        return this._router;
    }
}