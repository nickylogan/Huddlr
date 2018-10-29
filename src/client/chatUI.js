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
        this.chatForm = $('.chat-form');
        this.chatSend = $('.chat-send');
        this.chatWindow = $('#chat-container');
        this.chatScroll = $('.chat-scroll-bottom');
        this.userList = $('.user-list');

        // Add fontawesome libraries
        library.add(fas, far);
        dom.watch();

        // Set up perfect scrollbar
        this.userListPS = new PerfectScrollbar('#user-list-container', {
            suppressScrollX: true
        });
        this.chatWindowPS = new PerfectScrollbar('#chat-container', {
            suppressScrollX: true
        });

        // Add scrolling state
        this.scrolling = false;
    }

    initialize() {
        // Set up tooltips
        $('[data-toggle="tooltip"]').tooltip({
            delay: {
                'show': 500,
                'hide': 0
            },
            placement: 'auto'
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
        this
            .chatScroll
            .click(() => this.scrollToBottom());

        // Add scroll listeners to scrollbar
        this.chatWindow.on('ps-y-reach-end', () => {
            this.changeScrollingState(false);
        });

        this.chatWindow.on('ps-scroll-up', () => {
            this.changeScrollingState(true);
        });

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
            .chatWindow
            .append(el);

        setTimeout(() => {
            $('.chat-bubble.hidden').removeClass('hidden');
        }, 5);

        if (!this.scrolling) {
            console.log(this.chatWindow.prop('scrollHeight'));
            this.chatWindow.scrollTop(this.chatWindow.prop('scrollHeight'));
        }
        this.chatWindowPS.update();
    }

    sendMessage() {
        let msg = this.getMessageInput();
        if (!msg) return;
        this.clearMessageInput();
        // use callback to send message and cookie
        //

        // ONLY FOR UI TESTING! DELETE THESE LATER!
        this.appendMessage({
            user: Math.round(Math.random()) ? 'self' : 'other',
            message: msg,
            time: utils.getSimpleTime(),
            color: '#000'
        });
    }

    changeScrollingState(state) {
        this.scrolling = state;
        if (state)
            this.chatScroll.removeClass('hidden');
        else
            this.chatScroll.addClass('hidden');
    }

    scrollToBottom() {
        this.chatWindow.animate({
            scrollTop: this.chatWindow.prop('scrollHeight')
        }, 120);
    }

    appendUser(data) {
        let id = utils.escapeHtml(data.id);
        let color = utils.escapeHtml(data.color);
        let name = utils.escapeHtml(data.name);
        let el = `<li id="${id}" class="hidden" style="color:${color}">${name}</li>`;
        this.userList.append(el);
        setTimeout(() => {
            $('.user-list>li.hidden').removeClass('hidden');
        }, 5);
    }

    removeUser(userElementID) {
        let id = utils.escapeHtml(userElementID);
        $(`#${id}`).addClass('hidden');
        setTimeout(() => {
            $(`#${id}`).remove();
        }, 250);
    }
}

export default ChatUI;