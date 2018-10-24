import url from '../../resources/sass/style.scss';
import $ from 'jquery';

(function () {
    $('#roomWorld').click(() => {
        $('#room-id').attr('disabled', 'disabled');
    });
    $('#roomPrivate').click(() => {
        $('#room-id').removeAttr('disabled');
    });

    let form = $('#landingForm');
    form.submit((e) => form.find('input[name="type"]').length > 0);
    $('#joinRoom').click( function () {
        form.append($(`<input type="hidden" name="type" value="join">`));
        form.submit();
    });
    $('#createRoom').click( function () {
        form.append($(`<input type="hidden" name="type" value="create">`));
        form.submit();
    })
})()