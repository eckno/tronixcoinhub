$(document).ready(function () {
	/**
     * Submit button event handle, the following data-[attributes] can be defined for the button
     * @data waitme - {string} - Yes|No| - Load waitme overlay or not
     * @data target - {string} - Form submitted by the button
     * @data action - {string} - Action to be taken when form is submited
     */
    $('.submit_btn:not(.not_submit)').off('click').on('click', function (e) {
        e.preventDefault();
        var $this = $(this);

        // check of form has not been submitted
        if (!$this.hasClass('is_clicked')) {
            // show waitme overlay if submit button requires it
            if (typeof $this.data('waitme') !== 'undefined' && $this.data('waitme') == 'yes') {
                display_spinner();
            }
            // disable submitted button
            $this.addClass('is_clicked');
            $this.attr('disabled', 'disabled');
            $('.errors').removeClass('errors');
            $('.error_label').remove();

            // Setting Up Variables for form submission
            var action = '';
            var target_form_id = '';
            var callback_name = '';

            // Setting up action for form post submission
            if (typeof $this.data('action') !== 'undefined') {
                action = $this.data('action');
            }

            // check/get the submitted form is from the submit button
            if (typeof $this.data('target') !== 'undefined') {
                target_form_id = $this.data('target');
            }

            // check/get the success callback function
            if (typeof $this.data('callback_name') !== 'undefined') {
                callback_name = $this.data('callback_name');
            }

            // Submit Form
            if (!_.isEmpty(target_form_id)) {
                // Use Ajax to Submit form
                if (!_.isEmpty(action)) {
                    if (!_.isEmpty(callback_name)) {
                        do_form_submit(target_form_id, action, callback_name);
                    } else {
                        do_form_submit(target_form_id, action);
                    }
                } else {
                    if (!_.isEmpty(callback_name)) {
                        do_form_submit(target_form_id, null, callback_name);
                    } else {
                        do_form_submit(target_form_id);
                    }
                }
            } else {
                // Submit Form Directly
                $this.closest('form').submit();
            }
        }
    });

    

	build_errors();

    $('.close-modal').on('click', function() {
        $(this).closest('.modal').hide()
  });
  $('#close-modal').on('click', function() {
    $(this).closest('.modal').hide()
});
  $('.mobile-nav-close').on('click', function() {
    $('.sidenav').hide()
    $('body').removeClass('sidenav-open');
  });
  $('.hamburger-menu').on('click', function() {
    $('.sidenav').show()
    $('body').addClass('sidenav-open');
  });

  $('.appointment-timing-right').on('click', function() {
    $('.dropped-items-timing').toggleClass("open")
  })
  $('.keyword-remove').on('click', function(){
    $(this).closest('.inputted-keyword').hide()
  })
    
});