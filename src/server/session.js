let Session = function () {
    var users = {};
    var rooms = {};

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
        delete users[sessionID];
    }

    /**
     * @param {String} roomID
     */
    this.addRoom = function (roomID) {
        rooms[roomID] = [];
    }

    /**
     * @param {String} sessionID
     * @param {String} roomID
     */
    this.addUserToRoom = function (sessionID, roomID) {

    }

    /**
     * @param {String} sessionID
     * @param {String} roomID
     */
    this.removeUserFromRoom = function (sessionID, roomID) {

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
}

export default Session;