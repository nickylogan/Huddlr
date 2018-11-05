import Server from 'socket.io';
import Storage from './storage';
import * as events from '../events';
import * as utils from '../utils';
import ChatSocket from './chatSocket';

export default class PrivateChatSocket extends ChatSocket{
    /**
     * @callback BroadcastCallback
     * @param {Object} log
     * @param {String} log.type
     * @param {String} log.user
     * @param {String} log.message
     * @param {String} log.room
     */

    /**
     * @param {Server} io
     * @param {Storage} storage
     * @param {String} namespace
     * @param {BroadcastCallback} serverCallback
     */
    constructor(io, storage, namespace, serverCallback) {
        super(io, storage, namespace, serverCallback);
    }

    /**
     * @returns {PrivateChatSocket}
     */
    initialize() {
        this.nsp.on('connection', (socket) => {
            let sessionID = socket.request.sessionID;
            let user = this.storage.getUser(sessionID);
            let url = socket.request.headers.referer;
            let room = this.extractRoomID(url); // get room
            console.log('Room: ' + room);
            if (user) {
                this.broadcastConnectMessage(socket, user, sessionID, room);

                socket.on(events.CHAT_MESSAGE, (message) => {
                    this.broadcastChatMessage(socket, user, message, room);
                });

                socket.on(events.CLIENT_SEND_FILE_SLICE, (data) => {
                    this.storeFileSlice(socket, user, data, room);
                })

                socket.on('disconnect', () => {
                    this.broadcastDisconnectMessage(socket, user, sessionID, room);
                });
            }
        });
        return this;
    }

    broadcastChatMessage(socket, user, message, room) {
        socket.broadcast.to(room).emit(events.CHAT_MESSAGE, {
            user: user.name,
            message: message,
            time: utils.getSimpleTime(),
            color: user.color
        });
        this.broadcastServerLog({
            type: events.SERVER_CHAT,
            user: user.name,
            message: message,
            room: room,
        });
    }

    broadcastDisconnectMessage(socket, user, sessionID, room) {
        socket.leave(room);
        this.storage.removeUserFromRoom(sessionID, room);
        socket.broadcast.to(room).emit(events.CHAT_DISCONNECT, user);
        this.broadcastServerLog({
            type: events.SERVER_DISCONNECT,
            user: user.name,
            message: '',
            room: room,
        });
    }

    broadcastConnectMessage(socket, user, sessionID, room) {
        socket.join(room);
        this.storage.addUserToRoom(sessionID, room);
        socket.broadcast.to(room).emit(events.CHAT_CONNECT, user);

        this.broadcastServerLog({
            type: events.SERVER_CONNECT,
            user: user.name,
            message: '',
            room: room,
        });
    }

    storeFileSlice(socket, user, data, room) {
        this.storage.storeFileSlice(data);
        let complete = this.storage.fileIsComplete(data.name);
        if(complete) {
            console.log("FILE COMPLETE!");
            let res = this.storage.finalizeFile(data.name);
            if(!res.err) {
                socket.emit(events.SERVER_FINISH_RECEIVE_FILE);
                socket.broadcast.to(room).emit(events.CHAT_FILE, {
                    user: user.name,
                    file: {
                        name: res.alias,
                        size: res.size,
                        path: '/files/' + res.name,
                        ext: res.name.split('.').pop().toUpperCase(),
                    },
                    time: utils.getSimpleTime(),
                    color: user.color,
                });
                this.broadcastServerLog({
                    type: events.SERVER_FILE,
                    user: user.name,
                    message: res.alias,
                    room: room,
                })
            } else {
                socket.emit(events.SERVER_ERROR_RECEIVE_FILE, res.err);
            }
        } else {
            console.log("REQUEST FILE SLICE!");
            socket.emit(events.SERVER_REQUEST_FILE_SLICE, { 
                currentSlice: this.storage.getCurrentFileSlice(data.name)
            });
        }
    }

    extractRoomID(url) {
        return url.split('/').pop();
    }
}