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
import * as utils from './utils';

class ChatUI {
    constructor(socketCallback) {
        this.socketCallback = socketCallback;
        this.chatInput = $('.chat-msg');
        this.chatForm = $('.chat-input');
        this.chatSend = $('.chat-send');
        this.chatWrapper = $('.chat-bubble-wrapper');

        // Add fontawesome libraries
        library.add(fas, far);
        dom.watch();

        // Set up perfect scrollbar
        this.userList = new PerfectScrollbar('#user-list-container', {
            suppressScrollX: true
        });
        this.chatWindow = new PerfectScrollbar('#chat-container', {
            suppressScrollX: true
        });
    }

    initialize() {
        // Set up tooltips
        $('[data-toggle="tooltip"]').tooltip({
            delay: {
                'show': 500,
                'hide': 0
            },
            placement: 'right'
        });

        // Add event listeners to elements
        this
            .chatSend
            .click(() => this.sendMessage());
        this
            .chatInput
            .keypress((e) => {
                if (e.key == 'Enter') {
                    this.sendMessage();
                }
            });
        this
            .chatForm
            .submit((e) => e.preventDefault());

        return this;
    }

    getMessageInput() {
        return this
            .chatInput
            .val();
    }

    clearMessageInput() {
        this
            .chatInput
            .val('');
    }

    appendMessage(data) {
        let user = utils.escapeHtml(data.user);
        let msg = utils.escapeHtml(data.message);
        let time = utils.escapeHtml(data.time);
        let color = utils.escapeHtml(data.color);
        let el = data.user == 'self' ?
            `<div class="chat-bubble chat-bubble-self hidden"><p class="chat-text">${msg}</p><small class="chat-time">${time}</small></div>` :
            `<div class="chat-bubble chat-bubble-other hidden"><small class="chat-sender" style="color:${color}">${user}</small><p class="chat-text">${msg}</p><small class="chat-time">${time}</small></div>`;

        this
            .chatWrapper
            .append(el);

        setTimeout(() => {
            $('.chat-bubble.hidden').removeClass('hidden');
        }, 5);

        this.chatWindow.update();
    }

    sendMessage() {
        let msg = this.getMessageInput();
        this.clearMessageInput();
        // use callback to send message and cookie
        //

        // ONLY FOR UI TESTING! DELETE THESE LATER!
        this.appendMessage({
            user: 'other',
            message: msg,
            time: utils.getSimpleTime(),
            color: '#000'
        });
    }
}

export default ChatUI;