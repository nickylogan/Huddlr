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
import md5 from 'md5';
import * as utils from '../utils';
import dropify from 'dropify';
import ClientSocket from './clientSocket';
import FileIcons from 'file-icons-js';
import filesize from 'filesize';

import '../../resources/sass/style.scss';

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
    var fileModal = $('#fileModal');
    var tempFile = null;
    var tempFileName = '';
    var fileReader = null;
    var filePathMap = {};

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

    // Add uploading state
    var uploading = false;

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
        chatSend.click(() => this.sendMessage());
        chatInput.keypress((e) => {
            if (e.key == 'Enter') {
                this.sendMessage();
            }
        });
        chatForm.submit((e) => e.preventDefault());
        chatScroll.click(() => this.scrollToBottom());

        // Add scroll listeners to scrollbar
        chatWindow.on('ps-y-reach-end', () => {
            this.changeScrollingState(false);
        });

        chatWindow.on('ps-scroll-up', () => {
            this.changeScrollingState(true);
        });

        chatWindow.on('click', '.file-container', (e) => {
            let id = e.currentTarget.id;
            let fileName = $(e.currentTarget).find('.file-name')[0].innerText;
            this.downloadFile(id, fileName);
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
            chatWindow.scrollTop(chatWindow.prop('scrollHeight'));
        }
        chatWindowPS.update();
    }

    this.sendMessage = () => {
        let msg = this.getMessageInput();
        if (!msg.trim())
            return;
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
            chatWindow.scrollTop(chatWindow.prop('scrollHeight'));
        }
        chatWindowPS.update();
    }

    /**
     * @param {File} file
     */
    this.sendFile = (file) => {
        if (file) {
            uploading = true;
            // change into progress bar
            fileModal
                .find('.dropify-wrapper')
                .addClass('d-none');
            fileModal
                .find('.modal-body')
                .append(`<div class="file-upload">
            <p class="text-center">
            Uploading file...</p><div class="file-progress">
            <div class="file-progress-bar" role="progressbar" style="width: 0%">
            </div></div>
        </div>`);

            // remove close buttons
            fileModal
                .find('.modal-footer')
                .addClass('d-none');
            fileModal
                .find('.close')
                .addClass('d-none');

            // disable modal close console.log(fileModal.data('bs.modal'));
            fileModal
                .data('bs.modal')
                ._config
                .backdrop = 'static';

            fileReader = new FileReader();
            var slice = file.slice(0, 100000);

            tempFile = file;
            tempFileName = md5(file.name + new Date());
            this.sendFileSlice(0, slice);
        }
    }

    /**
     * @param {Number} progress
     * @param {Blob} slice
     */
    this.sendFileSlice = (progress, slice) => {
        fileModal
            .find('.file-progress-bar')
            .css({
                width: `${progress}%`
            });
        fileReader.readAsArrayBuffer(slice);
        fileReader.onload = (evt) => {
            var arrayBuffer = fileReader.result;
            socket.uploadFileSlice({
                name: tempFileName,
                type: tempFile.type,
                size: tempFile.size,
                alias: tempFile.name,
                data: arrayBuffer
            });
        };
    }

    this.sendRequestedFileSlice = (data) => {
        var place = data.currentSlice * 100000,
            slice = tempFile.slice(place, place + Math.min(100000, tempFile.size - place)),
            progress = Math.round(place / tempFile.size * 100);
        this.sendFileSlice(progress, slice);
    }

    this.finishFileUpload = () => {
        fileModal
            .find('.file-progress-bar')
            .css({
                width: `100%`
            });
        fileModal.modal('hide');
        fileModal.on('hidden.bs.modal', (e) => this.resetFileModal());

        this.appendFileMessage({
            user: 'self',
            file: {
                name: tempFile.name,
                size: tempFile.size,
                ext: tempFile.name.split('.').pop().toUpperCase(),
            },
            time: utils.getSimpleTime(),
            color: '#000',
        });
    }

    this.resetFileModal = () => {
        var dr = fileInput.dropify();
        dr = dr.data('dropify');
        dr.resetPreview();
        dr.clearElement();
        fileModal
            .find('.d-none')
            .removeClass('d-none');
        $('.file-upload').remove();
        fileModal
            .data('bs.modal')
            ._config
            .backdrop = true;
    }

    this.appendFileMessage = (data) => {
        let user = utils.escapeHtml(data.user);
        let fileName = utils.escapeHtml(data.file.name);
        let fileSize = filesize(data.file.size);
        let fileExt = utils.escapeHtml(data.file.ext);
        let filePath = data.file.path;
        let fileContainerID = '';
        if (filePath) {
            fileContainerID = md5(filePath);
            filePathMap[fileContainerID] = filePath;
        }

        let time = utils.escapeHtml(data.time);
        let color = utils.escapeHtml(data.color);

        let el = '';
        if (data.user == 'self') {
            el = `<div class="chat-bubble chat-bubble-self chat-bubble-file hidden">`;
        } else {
            el = `<div class="chat-bubble chat-bubble-other chat-bubble-file hidden">
            <small class="chat-sender" style="color:${color}">${user}</small>`;
        }
        el += `
            <div class="file-container" id="${fileContainerID}">
                <div class="file-preview">
                    <i class="file-icon ${FileIcons.getClassWithColor(fileName)}"></i>
                </div>
                <div class="file-name-container">
                    <p class="file-name">${fileName}</p>
                </div>
            </div>
            <div class="file-details">
                <small class="file-ext">${fileExt}</small>
                <small class="file-size">${fileSize}</small>
                <small class="chat-time">${time}</small>
            </div>
        </div>`;

        chatWindow.append(el);

        setTimeout(() => {
            $('.chat-bubble.hidden').removeClass('hidden');
        }, 5);

        if (!scrolling) {
            chatWindow.scrollTop(chatWindow.prop('scrollHeight'));
        }
        chatWindowPS.update();
    }

    this.downloadFile = (id, fileName) => {
        let path = filePathMap[id];
        $.ajax({
            xhr: () => {
                var xhr = new window.XMLHttpRequest();
                //Download progress
                xhr.addEventListener("progress", (evt) => {
                    if (evt.lengthComputable) {
                        var percentComplete = Math.round(evt.loaded / evt.total * 100);
                        $(`#${id}`).parent().find('.file-download-progress-bar').css({
                            width: `${percentComplete}%`
                        });
                        //Do something with download progress
                    }
                }, false);
                xhr.addEventListener('readystatechange', (e) => {
                    if (xhr.readyState == 2 && xhr.status == 200) {
                        $(`#${id}`).after(
                            `<div class="file-download-progress">
                                <div class="file-download-progress-bar" role="progressbar" style="width: 0%;"></div>
                            </div>`
                        );
                    } else if (xhr.readyState == 3) {
                        // Download is under progress
                    } else if (xhr.readyState == 4) {
                        $(`#${id}`).parent().find('.file-download-progress-bar').css({
                            width: '100%'
                        });
                        setTimeout(() => $(`#${id}`).parent().find('.file-download-progress').remove(), 500);
                    }
                });
                return xhr;
            },
            type: 'GET',
            url: path,
            success: function (data) {
                let blob = new Blob([new Uint8Array(data.data.data)], {
                    type: data.type
                });
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = fileName;
                // console.log(data);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        });
    }
}

export default ChatUI;