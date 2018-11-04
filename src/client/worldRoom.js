import ChatUI from './chatUI';
import ClientSocket from './clientSocket';

let socket = new ClientSocket('/world');
let chatUI = new ChatUI(socket).initialize();

socket.setConnectCallback(function (user) {
    chatUI.appendUser(user)
});
socket.setDisconnectCallback(function (user) {
    chatUI.removeUser(user)
});
socket.setMessageCallback(function (msg) {
    chatUI.appendMessage(msg)
});
socket.setFileSliceRequestCallback(function(data) {
    chatUI.sendRequestedFileSlice(data);
});
socket.setFileUploadFinishedCallback(function() {
    chatUI.finishFileUpload();
});
socket.setFileMessageCallback(function(msg) {
    chatUI.appendFileMessage(msg);
})
socket.setFileUploadErrorCallback(function(err) {
    alert("UPLOAD ERROR!");
    console.log(err);
})