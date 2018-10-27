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
    }

    appendLog(logElement) {
        this.serverLog.append(`<li>${logElement}</li>`);
    }
}

export default ServerUI;