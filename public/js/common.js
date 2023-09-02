var $spinner_container;

function display_spinner (overlay_text, overlay_container_id, overlay_color) {
    hide_spinner();

    $spinner_container = typeof overlay_container_id === "string" && overlay_container_id.trim() !== "" && $('#' + overlay_container_id)[0] ? $('#' + overlay_container_id) : $("body");
    var text = typeof overlay_text === "string" ? overlay_text : "Please wait while we process things, this may take a few seconds. <br/> DO NOT Reload the page!";
    var color = typeof overlay_color === "string" && overlay_color !== "" ? overlay_color : "#FFFFFF";

    $spinner_container.waitMe({
        effect: 'ios',
        text: text,
        bg: 'rgba(0, 0, 0, 0.7)',
        waitTime : -1,
        textPos : 'vertical',
        fontSize : '20px',
        color: color
    });
}
  
function hide_spinner() {
    if ($spinner_container) {
        $spinner_container.waitMe("hide");
    } else {
        $("body").waitMe("hide");
    }
}

/**
 * Do Form Submit Function, the following elements can be defined for the function
 * @data target_form_id - {string} - Form to Submit
 * @data action - {string} - Action to be taken when form is submited
 * @data callback - {function} - function to be executed after request is successfull
 */
function do_form_submit(target_form_id, action, callback_function) {
    var submit_url = $('#' + target_form_id).attr("action");
    var form_data = $('#' + target_form_id).serializeArray();

    if (!_.isUndefined(action) && !_.isEmpty(action)) {
        form_data.push({
            name: 'action',
            value: action
        });
    }

    $.ajax({
        type: "POST",
        url: submit_url,
        dataType: "JSON",
        data: form_data,
        success: function (response) {
            var success_message;
            var output_message = "";
            var redirect;

            if (!_.isUndefined(response) && !_.isEmpty(response)) {
                if (!_.isUndefined(response.success_message) && !_.isEmpty(response.success_message)) {
                    success_message = response.success_message;
                } else if (!_.isUndefined(response.data) && !_.isEmpty(response.data) && !_.isUndefined(response.data.success_message) && !_.isEmpty(response.data.success_message)) {
                    success_message = response.data.success_message;
                } else if (!_.isUndefined(response.message) && !_.isEmpty(response.message)) {
                    success_message = response.message;
                } else if (!_.isUndefined(response.data) && !_.isEmpty(response.data) && !_.isUndefined(response.data.message) && !_.isEmpty(response.data.message)) {
                    success_message = response.data.message;
                }

                if (!_.isUndefined(response.redirect_url) && !_.isEmpty(response.redirect_url)) {
                    redirect = response.redirect_url;
                } else if (!_.isUndefined(response.data) && !_.isEmpty(response.data) && !_.isUndefined(response.data.redirect_url) && !_.isEmpty(response.data.redirect_url)) {
                    redirect = response.data.redirect_url;
                }

                if (!_.isUndefined(response.show_inactive_modal) && !_.isEmpty(response.show_inactive_modal)){
                    $("#request-code-sent").modal("show");
                }
            }

            if (!_.isUndefined(callback_function) && !_.isEmpty(callback_function) && typeof window[callback_function] === "function") {
                window[callback_function](response);
            } else if (!_.isUndefined(success_message) && !_.isEmpty(success_message)) {
                hide_spinner();
                $('#' + target_form_id + ' .submit_btn').attr('disabled', false);
                $('#' + target_form_id + ' .submit_btn').removeClass('is_clicked');
                $('#' + target_form_id).trigger("reset");

                if (!_.isUndefined(redirect) && !_.isEmpty(redirect)) {
                    build_success_message(success_message, redirect);
                } else {
                    build_success_message(success_message);
                }
            } else {
                if (!_.isUndefined(redirect) && !_.isEmpty(redirect)) {
                    location.href = "" + redirect;
                } else {
                    hide_spinner();
                    $('#' + target_form_id + ' .submit_btn').attr('disabled', false);
                    $('#' + target_form_id + ' .submit_btn').removeClass('is_clicked');
                }
            }
        },
        error: function (result) {
            hide_spinner();
            $('#' + target_form_id + ' .submit_btn').attr('disabled', false);
            $('#' + target_form_id + ' .submit_btn').removeClass('is_clicked');

            var error_data = {};
            var returned_errors = {};
            var redirect = "";
            var response = result.responseJSON;

            if (!_.isUndefined(callback_function) && !_.isEmpty(callback_function) && typeof window[callback_function] === "function") {
                window[callback_function](response);
            } else {
                if (!_.isUndefined(response) && !_.isEmpty(response)) {
                    if (!_.isUndefined(response.errors) && !_.isEmpty(response.errors)) {
                        returned_errors = response.errors;
                    } else if (!_.isUndefined(response.data) && !_.isEmpty(response.data) && !_.isUndefined(response.data.errors) && !_.isEmpty(response.data.errors)) {
                        returned_errors = response.data.errors;
                    }

                    if (!_.isUndefined(response.redirect_url) && !_.isEmpty(response.redirect_url)) {
                        redirect = response.redirect_url;
                    } else if (!_.isUndefined(response.data) && !_.isEmpty(response.data) && !_.isUndefined(response.data.redirect_url) && !_.isEmpty(response.data.redirect_url)) {
                        redirect = response.data.redirect_url;
                    } else if (!_.isUndefined(returned_errors) && !_.isEmpty(returned_errors) && !_.isUndefined(returned_errors.redirect_url) && !_.isEmpty(returned_errors.redirect_url)) {
                        redirect = returned_errors.redirect_url;
                        try {
                            delete returned_errors.redirect_url;
                        } catch (e) {}
                    }
                }

                if (!_.isUndefined(returned_errors) && !_.isEmpty(returned_errors)) {
                    error_data = returned_errors;
                } else {
                    error_data = {server_error: "Sorry something went wrong, please refresh and try again."};
                }

                if (!_.isEmpty(redirect)) {
                    display_errors(error_data, target_form_id, redirect);
                } else {
                    display_errors(error_data, target_form_id);
                }
            }
        }
    });
}

// function to build errors and display them
function display_errors(errors, target_form_id, redirect_url) {
    $('.error_label').remove();
    $('.errors').removeClass('errors');
    hide_spinner();
    var output_message = "";
    var display_html = "";
    var error_heading = "";
    var focused = false;
    var show_alert = false;
    var show_error_label = false;
    var j = 1;

    if (typeof target_form_id !== 'undefined' && target_form_id !== '' && $('#' + target_form_id)[0] && $('#' + target_form_id).data('show_error_label') === "no") {
        show_error_label = false;
    } else if (typeof target_form_id !== 'undefined' && target_form_id !== '' && $('#' + target_form_id)[0] && $('#' + target_form_id).data('show_error_label') === "yes") {
        show_error_label = true;
    }

    if (_.isObject(errors) || _.isArray(errors)) {
        $.each(errors, function (key, val) {
            if (val !== null && typeof val === 'object') {
                if (show_alert === false) {
                    show_alert = true;
                }
                var val_array = $.map(val, function (value, index) {
                    return [value];
                });

                display_html += "<h5><b>" + key + "</b></h5>";
                for (var i = 0; i < val_array.length; i++) {
                    display_html += val_array[i] + "<br/>";
                }
                j++;
            } else if (val !== null && typeof val !== 'object') {
                if (key !== null && key === 'error_heading') {
                    error_heading = val;
                    if (show_alert === false) {
                        show_alert = true;
                    }
                } else {
                    var selector = (typeof target_form_id !== 'undefined' && target_form_id !== '' && $('#' + target_form_id).length) ? "#" + target_form_id + " [name='" + key + "']" : "[name='" + key + "']";
                    var selector_for = (typeof target_form_id !== 'undefined' && target_form_id !== '' && $('#' + target_form_id).length) ? "#" + target_form_id + " [for='" + key + "']" : "[for='" + key + "']";
                    if (focused === false) {
                        if ($(selector)[0]) {
                            $(selector).focus();
                            focused = true;
                        }
                    }

                    if (show_alert === false) {
                        if (!$(selector).length) {
                            show_alert = true;
                        }
                    }

                    var error_label = '<div class="error_label">' + val + '</div>';
                    if (key !== 'g-recaptcha-response') {
                        if ($(selector)[0]) {
                            if ($(selector).attr('type') == 'radio' || $(selector).attr('type') == 'checkbox') {
                                if (show_alert === false) {
                                    show_alert = true;
                                }
                                $(selector).parent().addClass('errors');
                                $(selector).addClass('errors');
                                $(selector_for).addClass('errors');
                            } else if ($(selector).attr('type') == 'hidden') {
                                $(selector).addClass('errors');
                                $(selector_for).addClass('errors');
                                if (show_error_label === true) {
                                    $(selector_for).parent().after(error_label);
                                }
                            } else {
                                // $(selector_for).addClass('errors');
                                $(selector).addClass("errors");
                                if (show_error_label === true) {
                                    $(selector).after(error_label);
                                }
                            }
                        }
                    } else if (key === 'g-recaptcha-response') {
                        $('.g-recaptcha').after(error_label);
                    }

                    display_html += val + "<br/>";

                    if ($('.g-recaptcha').length) {
                        var c = $('.g-recaptcha').length;
                        for (var i = 0; i < c; i++) {
                            grecaptcha.reset(i);
                        }
                    }
                }
            }
        });
    } else {
        show_alert = true;
        if (_.isString(errors)) {
            display_html += errors;
        } else {
            display_html += "Sorry something went wrong, please refresh and try again.";
        }
    }

    if (typeof target_form_id !== 'undefined' && target_form_id !== '' && $('#' + target_form_id)[0] && $('#' + target_form_id).data('show_alert') === "no") {
        show_alert = false;
    } else if (typeof target_form_id !== 'undefined' && target_form_id !== '' && $('#' + target_form_id)[0] && $('#' + target_form_id).data('show_alert') === "yes") {
        show_alert = true;
    }

    if (show_alert === true) {
        if (!_.isUndefined(error_heading) && !_.isEmpty(error_heading)) {
            output_message = "<div class='error_body'><div class='error_heading'>" + error_heading + "</div>" + display_html + "</div>";
        } else {
            output_message = "<div class='error_body'>" + display_html + "</div>";
        }
        var meessage_object = {
            message: output_message,
            className: 'custom-error-bootbox-modal',
            callback: function() {
                if (!_.isUndefined(redirect_url) && !_.isEmpty(redirect_url)) {
                    display_spinner();
                    location.href = "" + redirect_url;
                }
            }
        }
        bootbox.alert(meessage_object);
    }
}

function build_errors () {
    if (!_.isUndefined(errors) && (_.size(errors) > 0)) {
        display_errors(errors);
    }
}

function build_success_message (success_message, redirect_url) {
    var display_html = "";
    var success_heading = "";
    var output_message = "";
    if (!_.isUndefined(success_message) && !_.isEmpty(success_message)) {
        if (_.isObject(success_message) || _.isArray(success_message)) {
            $.each(success_message, function (key, val) {
                if (val !== null && typeof val === 'object') {
                    var val_array = $.map(val, function (value, index) {
                        return [value];
                    });

                    display_html += "<h5><b>" + key + "</b></h5>";
                    for (var i = 0; i < val_array.length; i++) {
                        display_html += val_array[i] + "<br/>";
                    }
                    j++;
                } else if (val !== null && typeof val !== 'object') {
                    if (key !== null && key === 'success_heading') {
                        success_heading = val;
                    } else {
                        display_html += val + "<br/>";
                    }
                }
            });
        } else {
            if (_.isString(success_message)) {
                display_html += success_message;
            } else {
                display_html += "Success!";
            }
        }
        if (!_.isUndefined(success_heading) && !_.isEmpty(success_heading)) {
            output_message = "<div class='message_body'><div class='success_heading'>" + success_heading + "</div>" + display_html + "</div>";
        } else {
            output_message = "<div class='message_body'>" + display_html + "</div>";
        }

        var meessage_object = {
            message: output_message,
            className: 'custom-message-bootbox-modal',
            callback: function() {
                if (!_.isUndefined(redirect_url) && !_.isEmpty(redirect_url)) {
                    display_spinner();
                    location.href = "" + redirect_url;
                }
            }
        }

        bootbox.alert(meessage_object);
    }
}

String.prototype.ucwords = function () {
    var words = this.split(' ');
    for (var i = 0; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
    return words.join(' ');
};