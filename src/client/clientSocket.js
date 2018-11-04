import io from 'socket.io-client';
import * as events from '../events';

/**
 * @param {String} namespace;
 */
let ClientSocket = function (namespace) {
    var socket = io(namespace);

    /**
     * @param {String} message
     */
    this.sendMessage = function (message) {
        socket.emit(events.CHAT_MESSAGE, message);
    }

    /**
     * @param {Object} slice
     * @param {String} slice.name
     * @param {String} slice.type
     * @param {Number} slice.size
     * @param {ArrayBuffer} slice.data
     */
    this.uploadFileSlice = function(slice) {
        console.log("CLIENT UPLOAD FILE SLICE");
        socket.emit(events.CLIENT_SEND_FILE_SLICE, slice);
    }

    /**
     * @callback ConnectionCallback
     * @param {Object} userData
     * @param {String} userData.name
     * @param {String} userData.color
     * @param {String} userData.elementID
     */

    /**
     * @param {ConnectionCallback} callback 
     */
    this.setConnectCallback = function (callback) {
        socket.on(events.CHAT_CONNECT, callback);
    };

    /**
     * @callback DisconnectionCallback
     * @param {Object} userData
     * @param {String} userData.name
     * @param {String} userData.color
     * @param {String} userData.elementID
     */

    /**
     * @param {DisconnectionCallback} callback
     */
    this.setDisconnectCallback = function (callback) {
        socket.on(events.CHAT_DISCONNECT, callback);
    }

    /**
     * @callback MessageCallback
     * @param {Object} message
     * @param {String} message.user
     * @param {String} message.message
     * @param {String} message.time
     * @param {String} message.color
     */

    /**
     * @param {MessageCallback} callback
     */
    this.setMessageCallback = function (callback) {
        socket.on(events.CHAT_MESSAGE, callback);
    }

    /**
     * @callback FileSliceRequestCallback
     * @param {Object} data
     * @param {Number} data.currentSlice
     */

    /**
     * @param {FileSliceRequestCallback} callback
     */
    this.setFileSliceRequestCallback = function (callback) {
        socket.on(events.SERVER_REQUEST_FILE_SLICE, callback);
    }

    this.setFileUploadFinishedCallback = function(callback) {
        socket.on(events.SERVER_FINISH_RECEIVE_FILE, callback);
    }

    this.setFileUploadErrorCallback = function(callback) {
        socket.on(events.SERVER_ERROR_RECEIVE_FILE, callback);
    }

    /**
     * @callback FileMessageCallback
     * @param {Object} message
     * @param {String} message.user
     * @param {Object} message.file
     * @param {String} message.file.name
     * @param {Number} message.file.size
     * @param {String} message.file.ext
     * @param {String} message.time
     * @param {String} message.color
     */

    /**
     * @param {FileMessageCallback} callback
     */
    this.setFileMessageCallback = function (callback) {
        socket.on(events.CHAT_FILE, callback);
    }
};

export default ClientSocket;