import $ from 'jquery';
import popper from 'popper.js';
import bootstrap from 'bootstrap';
import {
    library,
    dom
} from '@fortawesome/fontawesome-svg-core';
import {
    fas
} from '@fortawesome/free-solid-svg-icons';
import {
    far
} from '@fortawesome/free-regular-svg-icons';
import PerfectScrollbar from 'perfect-scrollbar';
import 'perfect-scrollbar/css/perfect-scrollbar.css';
import '../../resources/sass/style.scss';
import * as utils from '../utils';
import dropify from 'dropify';
import ClientSocket from './clientSocket';

/**
 * @param {ClientSocket} socket;
 */
var ChatUI = function (socket) {
    var socket = socket;
    var chatInput = $('.chat-msg');
    var chatForm = $('.chat-form');
    var chatSend = $('.chat-send');
    var chatWindow = $('#chat-container');
    var chatScroll = $('.chat-scroll-bottom');
    var userList = $('.user-list');
    var fileInput = $('.file-input');
    var sendFile = $('#sendFile');
    var tempFile = null;
    var tempFileName = '';
    var fileReader = null;

    // Add fontawesome libraries
    library.add(fas, far);
    dom.watch();

    // Set up perfect scrollbar
    var userListPS = new PerfectScrollbar('#user-list-container', {
        suppressScrollX: true
    });
    var chatWindowPS = new PerfectScrollbar('#chat-container', {
        suppressScrollX: true
    });

    // Add scrolling state
    var scrolling = false;

    this.initialize = () => {
        // Set up tooltips
        $('[data-toggle="tooltip"]').tooltip({
            delay: {
                'show': 500,
                'hide': 0
            },
            placement: 'auto'
        });

        // Add event listeners to elements
        chatSend
            .click(() => this.sendMessage());
        chatInput
            .keypress((e) => {
                if (e.key == 'Enter') {
                    this.sendMessage();
                }
            });
        chatForm
            .submit((e) => e.preventDefault());
        chatScroll
            .click(() => this.scrollToBottom());

        // Add scroll listeners to scrollbar
        chatWindow.on('ps-y-reach-end', () => {
            this.changeScrollingState(false);
        });

        chatWindow.on('ps-scroll-up', () => {
            this.changeScrollingState(true);
        });

        fileInput.dropify();

        sendFile.click((e) => {
            let file = this.getFile();
            this.sendFile(file);
        });

        return this;
    }

    this.getMessageInput = () => {
        return chatInput.val();
    }

    this.clearMessageInput = () => {
        chatInput.val('');
    }

    this.getFile = () => {
        return fileInput.prop('files')[0];
    }

    this.appendMessage = (data) => {
        let user = utils.escapeHtml(data.user);
        let msg = utils.escapeHtml(data.message);
        let time = utils.escapeHtml(data.time);
        let color = utils.escapeHtml(data.color);
        let el = data.user == 'self' ?
            `<div class="chat-bubble chat-bubble-self hidden"><p class="chat-text">${msg}</p><small class="chat-time">${time}</small></div>` :
            `<div class="chat-bubble chat-bubble-other hidden"><small class="chat-sender" style="color:${color}">${user}</small><p class="chat-text">${msg}</p><small class="chat-time">${time}</small></div>`;

        chatWindow.append(el);

        setTimeout(() => {
            $('.chat-bubble.hidden').removeClass('hidden');
        }, 5);

        if (!scrolling) {
            console.log(chatWindow.prop('scrollHeight'));
            chatWindow.scrollTop(chatWindow.prop('scrollHeight'));
        }
        chatWindowPS.update();
    }

    this.sendMessage = () => {
        let msg = this.getMessageInput();
        if (!msg) return;
        this.clearMessageInput();
        this.appendMessage({
            user: 'self',
            message: msg,
            time: utils.getSimpleTime(),
            color: '#000'
        });
        socket.sendMessage(msg);
    }

    this.changeScrollingState = (state) => {
        scrolling = state;
        if (state)
            chatScroll.removeClass('hidden');
        else
            chatScroll.addClass('hidden');
    }

    this.scrollToBottom = () => {
        chatWindow.animate({
            scrollTop: chatWindow.prop('scrollHeight')
        }, 120);
    }

    this.appendUser = (data) => {
        let id = utils.escapeHtml(data.elementID);
        let color = utils.escapeHtml(data.color);
        let name = utils.escapeHtml(data.name);
        let el = `<li id="${id}" class="hidden" style="color: rgba(0,0,0,.5)"><i class="fas fa-xs fa-circle mr-3" style="color:${color}"></i>${name}</li>`;
        userList.append(el);
        userListPS.update();
        setTimeout(() => {
            $('.user-list>li.hidden').removeClass('hidden');
        }, 5);

        chatWindow.append(`<div class="chat-connection"><small>${name} has connected</small></div>`);
        if (!scrolling) {
            console.log(chatWindow.prop('scrollHeight'));
            chatWindow.scrollTop(chatWindow.prop('scrollHeight'));
        }
        chatWindowPS.update();
    }

    this.removeUser = (data) => {
        let id = utils.escapeHtml(data.elementID);
        let name = utils.escapeHtml(data.name);
        $(`#${id}`).addClass('hidden');
        setTimeout(() => {
            $(`#${id}`).remove();
        }, 250);

        chatWindow.append(`<div class="chat-connection">
        <small>${name} has disconnected</small>
    </div>`);
        if (!scrolling) {
            console.log(chatWindow.prop('scrollHeight'));
            chatWindow.scrollTop(chatWindow.prop('scrollHeight'));
        }
        chatWindowPS.update();
    }

    /**
     * @param {File} file
     */
    this.sendFile = (file) => {
        fileReader = new FileReader();
        var slice = file.slice(0, 1000000);

        tempFile = file;
        tempFileName = file.name + new Date();
        this.sendFileSlice(slice);
    }

    /**
     * @param {Blob} slice
     */
    this.sendFileSlice = (slice) => {
        fileReader.readAsArrayBuffer(slice);
        fileReader.onload = (evt) => {
            var arrayBuffer = fileReader.result;
            socket.uploadFileSlice({
                name: tempFileName,
                type: file.type,
                size: file.size,
                alias: file.name,
                data: arrayBuffer
            });
        };
    }

    this.sendRequestedFileSlice = (data) => {
        var place = data.currentSlice * 100000,
            slice = tempFile.slice(place, place + Math.min(100000, tempFile.size - place));

        this.sendFileSlice(slice);
    }
}

export default ChatUI;