import socketio from 'socket.io';
import SessionData from './sessionData';
import * as events from '../events';
import * as utils from '../utils';

export default class Socket {
    /**
     * @param {SessionData} sessionData
     */
    constructor(app, session, sessionData) {
        this.io = socketio.listen(app);

        this.worldNS = this.io.of('/world');
        this.privateNS = this.io.of('/private');
        this.serverNS = this.io.of('/server');
        this.sessionData = sessionData;
        this.session = session;

        this.io.use(function (socket, next) {
            session(socket.request, socket.request.res, next);
        })
        this.initialize.bind(this);
    }

    /**
     * @returns {Socket}
     */
    initialize() {
        this.worldNS.on('connection', (socket) => {
            let sessionID = socket.request.sessionID;
            let user = this.sessionData.getUser(sessionID);
            if (user) {
                this.sessionData.addUserToRoom(sessionID, 'world');

                socket.broadcast.emit(events.CHAT_CONNECT, user);

                this.broadcastServerLog({
                    type: events.SERVER_CONNECT,
                    user: user.name,
                    message: '',
                    room: 'WORLD',
                });

                socket.on(events.CHAT_MESSAGE, (message) => {
                    socket.broadcast.emit(events.CHAT_MESSAGE, {
                        user: user.name,
                        message: message,
                        time: utils.getSimpleTime(),
                        color: user.color
                    });
                    this.broadcastServerLog({
                        type: events.SERVER_CHAT,
                        user: user.name,
                        message: message,
                        room: 'WORLD',
                    });
                });

                socket.on('disconnect', () => {
                    this.sessionData.removeUserFromRoom(sessionID, 'world');
                    socket.broadcast.emit(events.CHAT_DISCONNECT, user.elementID);
                    this.broadcastServerLog({
                        type: events.SERVER_DISCONNECT,
                        user: user.name,
                        message: '',
                        room: 'WORLD',
                    });
                });
            }
        });
        return this;
    }

    /**
     * @param {Object} log
     * @param {String} log.type
     * @param {String} log.user
     * @param {String} log.message
     * @param {String} log.room
     */
    broadcastServerLog(log) {
        log.time = utils.getTerminalTime();
        this.sessionData.appendLog(log);
        console.log(log);
        this.serverNS.emit(events.SERVER_LOG, log);
    }
}