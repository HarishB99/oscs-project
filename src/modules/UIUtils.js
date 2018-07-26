const UIUtils = function() {};

UIUtils.showSnackbar = function (message, actionText, actionHandler) {
    var notification = document.querySelector('.mdl-js-snackbar');
    var data = {
        message: message,
        timeout: 5000
    };
    if (typeof actionText !== "undefined") {
        if (actionText) {
            data.actionText = actionText;
            data.actionHandler = actionHandler;
        }
    }
    // console.log(data);
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
    location.replace('/login');
};

UIUtils.stillAnyInvalid = function() {
    var anyFieldIsInvalid = false;

    document.querySelectorAll('.mdl-textfield')
    .forEach(function(input) {
        if (input.classList.contains('is-invalid')) {
            UIUtils.showSnackbar("Please check your input and try again.");
            anyFieldIsInvalid = true;
        }
    });

    return anyFieldIsInvalid;
};

UIUtils.toggleSwitch = function(condition, el) {
    if (condition) {
        if (!el.parentElement.classList.contains('is-checked'))
            el.parentElement.classList.add('is-checked');
    } else {
        if (el.parentElement.classList.contains('is-checked'))
            el.parentElement.classList.remove('is-checked')
    }
};

UIUtils.toggleLoader = function(show, mdl_spinner_holder) {
    if (show) {
        mdl_spinner_holder.style.display = 'block';
    } else {
        mdl_spinner_holder.style.display = 'none';
    }
};

UIUtils.clearTable = function(tbody, classToRemove) {
    var rows = document.querySelectorAll('.'.concat(classToRemove));
    if (rows.length !== 0) {
        for (let i = 0; i < rows.length; i++) {
            tbody.removeChild(rows[i]);
        }
    }
};

export default UIUtils;