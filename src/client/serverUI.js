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
import * as events from '../events';

class ServerUI {
    constructor() {
        // Add fontawesome libraries
        library.add(fas, far);
        dom.watch();

        this.serverLog = $('.server-log');
        this.serverLogContainer = $('.server-log-container');

        this.serverLogContainerPS = new PerfectScrollbar('.server-log-container');

        this.scrolling = false;

        // Add scroll listeners to scrollbar
        this.serverLogContainer.on('ps-y-reach-end', () => {
            this.changeScrollingState(false);
        });

        this.serverLogContainer.on('ps-scroll-up', () => {
            this.changeScrollingState(true);
        });
    }

    appendLog(log) {
        let el = ServerUI.getLogElement(log);
        this.serverLog.append(el);
        // if(this.serverLog.children('li').length >= 100) {
        //     this.serverLog.find('li:first-child').remove();
        // }

        if(!this.scrolling) {
            this.serverLogContainer.scrollTop(this.serverLogContainer.prop('scrollHeight'));
        }
        this.serverLogContainerPS.update();
    }

    changeScrollingState(state) {
        this.scrolling = state;
    }

    /**
     * @param {Object} log
     * @param {String} log.time
     * @param {String} log.type
     * @param {String} log.user
     * @param {String} log.message
     * @param {String} log.room
     */
    static getLogElement(log) {
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
            case events.SERVER_FILE:
                content = `<span class="text-primary">&lt;&lt;ROOM:${log.room}&gt;&gt;</span> <span class="text-warning">${log.user}</span> sent a file: <span class="text-info">${log.message}</span>`;
                break;
            default:
                content = `asdf`
                break;
        }
        let el = `<li><span class="text-secondary">${time} </span>${content}</li>`;
        return el;
    }
}

export default ServerUI;