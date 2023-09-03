$(document).ready(function() {

    $("#registration-form").off("submit").on("submit", function(e) {
        e.preventDefault();
        display_spinner();
        do_form_submit('registration-form');
    });

    $("#login-form").off("submit").on("submit", function(e) {
        e.preventDefault();
        display_spinner();
        do_form_submit('login-form');
    });

    $("#forgot-password").off("submit").on("submit", function(e) {
        e.preventDefault();
        display_spinner();
        do_form_submit('forgot-password');
    });

    $("#profile-form").off("submit").on("submit", function(e) {
        e.preventDefault();
        display_spinner();
        do_form_submit('profile-form');
    });
    $("#change-password-form").off("submit").on("submit", function(e) {
        e.preventDefault();
        display_spinner();
        do_form_submit('change-password-form');
    });

    $("#enabled_two_factor").off("click").on("click", function(e) {
        e.preventDefault();
        display_spinner();
        do_form_submit('enabled_two_factor', "/secure/profile/settings_2fa");
    });
    $("#disable_two_factor").off("click").on("click", function(e) {
        e.preventDefault();
        display_spinner();
        do_form_submit('disable_two_factor', "/secure/profile/settings_2fa_disable");
    });
    
    $('#emailNotification').change(function() {
        if ($(this).is(':checked')) {
            display_spinner();
            do_form_submit('notification-form');
        } else {
            display_spinner();
            do_form_submit('notification-form');
        }
   
    });
    $('#withdrawalNotification').change(function() {
        if ($(this).is(':checked')) {
            display_spinner();
            do_form_submit('notification-form');
        } else {
            display_spinner();
            do_form_submit('notification-form');
        }
   
    });
    $('#depositNotification').change(function() {
        if ($(this).is(':checked')) {
            display_spinner();
            do_form_submit('notification-form');
        } else {
            display_spinner();
            do_form_submit('notification-form');
        }
   
    });

    $("#deposit-form").off("submit").on("submit", function(e) {
        e.preventDefault();
        display_spinner();
        do_form_submit('deposit-form');
    });
    // $(".input_code").on("input", function() {
    //     var maxLength = parseInt($(this).attr("maxlength"));
    //     var inputValue = $(this).val();
    
    //     if (inputValue.length === maxLength) {
    //       var $nextInput = $(this).next(".input_code");
    //       if ($nextInput.length) {
    //         $nextInput.focus();
    //       }
    //     }
    //   });

});