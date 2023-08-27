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