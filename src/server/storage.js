import fs from 'fs';

let Storage = function () {
    var users = {};
    var rooms = {
        world: new Set()
    };
    var logs = [];
    var files = {};
    var struct = {
        name: null,
        type: null,
        alias: null,
        size: 0,
        data: [],
        slice: 0,
    };

    /**
     * @param {String} sessionID
     * @param {Object} userData
     * @param {String} userData.name
     * @param {String} userData.color
     * @param {String} userData.elementID
     */
    this.addUserSession = function (sessionID, userData) {
        users[sessionID] = userData;
    }

    /**
     * @param {String} sessionID
     */
    this.removeUserSession = function (sessionID) {
        for (var room in rooms) {
            rooms[room].delete(sessionID);
        }
        delete users[sessionID];
    }

    /**
     * @param {String} roomID
     */
    this.addRoom = function (roomID) {
        rooms[roomID] = new Set();
    }

    /**
     * @param {String} sessionID
     * @param {String} roomID
     */
    this.addUserToRoom = function (sessionID, roomID) {
        rooms[roomID].add(sessionID);
    }

    /**
     * @param {String} sessionID
     * @param {String} roomID
     */
    this.removeUserFromRoom = function (sessionID, roomID) {
        rooms[roomID].delete(sessionID);
    }

    /**
     * @param {String} roomID
     * @returns {Object}
     */
    this.getRoom = function (roomID) {
        return rooms[roomID];
    }

    /**
     * @param {String} sessionID
     * @returns {Object}
     */
    this.getUser = function (sessionID) {
        return users[sessionID];
    }

    /**
     * @param {String} roomID
     * @returns {Object}
     */
    this.getUsersInRoom = (roomID) => {
        return rooms[roomID] ? Array.from(rooms[roomID]).reduce((object, x) => {
            let user = this.getUser(x);
            object[x] = user;
            return object;
        }, {}) : undefined;
    }

    /**
     * @param {String} roomID
     * @param {String} sessionID
     * @returns {Array}
     */
    this.getUsersInRoomExcept = (roomID, sessionID) => {
        let users = this.getUsersInRoom(roomID);
        delete users[sessionID];
        return Object.values(users);
    }

    /**
     * @param {Object} log
     * @param {String} log.time
     * @param {String} log.type
     * @param {String} log.user
     * @param {String} log.message
     * @param {String} log.room
     */
    this.appendLog = function (log) {
        logs.push(log);
    }

    /**
     * @returns {Array}
     */
    this.logs = function () {
        return logs;
    }

    this.storeFileSlice = (data) => {
        if (!files[data.name]) {
            files[data.name] = Object.assign({}, struct, data);
            files[data.name].data = [];
        }

        //convert the ArrayBuffer to Buffer 
        data.data = Buffer.from(new Uint8Array(data.data));

        //save the data 
        files[data.name].data.push(data.data);
        files[data.name].slice++;
    }

    this.fileIsComplete = (name) => {
        let result = files[name].slice * 100000 >= files[name].size;
        if (result) console.log(files);
        return result;
    }

    this.getCurrentFileSlice = (name) => {
        return files[name].slice;
    }

    this.finalizeFile = (name) => {
        var fileBuffer = Buffer.concat(files[name].data);
        let ext = files[name].alias.split('.').pop();
        let finalName = `${files[name].name}.${ext}`
        let path = __dirname + `/../../upload/${finalName}`;
        let res = {
            alias: files[name].alias,
            size: files[name].size,
            name: finalName
        };
        // console.log(path);
        fs.writeFile(path, fileBuffer, (err) => {
            delete files[name];
            if (err) {
                res['err'] = err;
            }
        });
        return res;
    }
}

export default Storage;