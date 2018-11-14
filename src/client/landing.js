import url from '../../resources/sass/style.scss';
import $ from 'jquery';
import bootstrap from 'bootstrap';
import popper from 'popper.js';
import * as Toastr from 'toastr';
import 'toastr/build/toastr.css';

(function () {
    $('#roomWorld').click(() => {
        $('#roomID').prop('disabled', 'true');
        $('#roomID').removeAttr('required');
        $('#roomID').removeClass('is-invalid');
    });
    $('#roomPrivate').click(() => {
        $('#roomID').removeAttr('disabled');
        $('#roomID').prop('required', 'true');
    });

    let form = $('#landingForm');

    function validateForm() {
        var valid = true;
        $('input[required]').each(function () {
            $(this).val($(this).val().trim());
            if (!$(this).val()) {
                $(this).addClass('is-invalid');
                $(this).removeClass('is-valid');
                valid = false;
            } else {
                $(this).removeClass('is-invalid');
                $(this).addClass('is-valid');
            }
        });

        if (!valid) {
            form.find('input[name="type"]').remove();
            Toastr.error('Please fill all the required fields', 'Form error');
        }
        return valid;
    }
    form.submit(function (e) {
        return validateForm();
    });

    $('#joinRoom').click(function () {
        form.append($(`<input type="hidden" name="type" value="join">`));
        form.submit();
    });
    $('#createRoom').click(function () {
        form.append($(`<input type="hidden" name="type" value="create">`));
        form.submit();
    });
})()