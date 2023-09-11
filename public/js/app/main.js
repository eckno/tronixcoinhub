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
    $("#withdrawal-form").off("submit").on("submit", function(e) {
        e.preventDefault();
        display_spinner();
        do_form_submit('withdrawal-form');
    });

    $("#tronic-basic-form").off("submit").on("submit", function(e) {
        e.preventDefault();
        display_spinner();
        do_form_submit('tronic-basic-form');
    });
    $("#tronic-espp-form").off("submit").on("submit", function(e) {
        e.preventDefault();
        display_spinner();
        do_form_submit('tronic-espp-form');
    });

    $("#tronic-black-form").off("submit").on("submit", function(e) {
        e.preventDefault();
        display_spinner();
        do_form_submit('tronic-black-form');
    });
    $("#tronic-pro-form").off("submit").on("submit", function(e) {
        e.preventDefault();
        display_spinner();
        do_form_submit('tronic-pro-form');
    });

    $("#tronic-aglenergy-form").off("submit").on("submit", function(e) {
        e.preventDefault();
        display_spinner();
        do_form_submit('tronic-aglenergy-form');
    });
    $("#tronic-bonds-form").off("submit").on("submit", function(e) {
        e.preventDefault();
        display_spinner();
        do_form_submit('tronic-bonds-form');
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

function updateCountdown() {
  const targetDate = new Date("11-09-2023").getTime();
  const currentDate = new Date().getTime();
  const timeDifference = targetDate - currentDate;

  if (timeDifference <= 0) {
    clearInterval(countdownInterval);
    document.getElementById("countdown").innerHTML = "Countdown expired!";
    return;
  }

  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

  document.getElementById("countdown").innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Update the countdown immediately and then every second