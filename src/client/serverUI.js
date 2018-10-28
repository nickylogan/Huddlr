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
        let time = utils.getTerminalTime();
        let content = '';
        switch (log.type) {
            case 'connect':
                content = `<span class="text-primary">&lt;&lt;ROOM:${log.room}&gt;&gt;</span> <span class="text-warning">${log.user}</span> has <span class="text-success">connected</span>`;
                break;
            case 'disconnect':
                content = `<span class="text-primary">&lt;&lt;ROOM:${log.room}&gt;&gt;</span> <span class="text-warning">${log.user}</span> has <span class="text-danger">disconnected</span>`;
                break;
            case 'chat':
                content = `<span class="text-primary">&lt;&lt;ROOM:${log.room}&gt;&gt;</span> <span class="text-warning">${log.user}</span> sent message <span class="text-info">"${log.message}"</span>`;
                break;
            default:
                content = `asdf`
                break;
        }
        let el = `<li><span class="text-secondary">${time} </span>${content}</li>`
        this.serverLog.append(el);
        if(this.serverLog.children('li').length >= 100) {
            this.serverLog.find('li:first-child').remove();
        }

        if(!this.scrolling) {
            this.serverLogContainer.scrollTop(this.serverLogContainer.prop('scrollHeight'));
        }
        this.serverLogContainerPS.update();
    }

    changeScrollingState(state) {
        this.scrolling = state;
    }
}

export default ServerUI;