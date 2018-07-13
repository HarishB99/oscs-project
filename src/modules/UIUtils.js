const UIUtils = function() {};

UIUtils.showSnackbar = function (message, actionText, actionHandler) {
    var notification = document.querySelector('.mdl-js-snackbar');
    var data = {
        message: message,
        timeout: 10000
    };
    if (!InputValidator.isEmpty(actionText)) {
        data.actionText = actionText;
        data.actionHandler = actionHandler;
    }
    console.log(data);
    if (notification.getAttribute('aria-hidden') !== "false")
        notification.MaterialSnackbar.showSnackbar(data);
};

UIUtils.update_text_field_ui = function(el, valid) {
    if (valid) {
        if (el.parentElement.classList.contains('is-invalid')) {
            const elParent = el.parentElement;
            elParent.className = elParent.classList.remove('is-invalid');
        }
    } else {
        if (!el.parentElement.classList.contains('is-invalid')) {
            el.parentElement.classList.add('is-invalid');
        }
    }
};

UIUtils.logoutUI = function() {
    window.alert('You are not logged in.');
    location.replace('/login');
};

UIUtils.stillAnyInvalid = function() {
    var anyFieldIsInvalid = false;
    document.querySelectorAll('.mdl-textfield')
    .forEach(function(input) {
        if (input.classList.contains('is-invalid')) {
            showSnackbar("Please check your input and try again.");
            anyFieldIsInvalid = true;
        }
    });
    return anyFieldIsInvalid;
};

export default UIUtils;