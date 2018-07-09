// Side panel buttons
var rule_btn = document.getElementById("mdl-navigation__link--rules");
// Side panel menu button
var profile_btn = document.getElementById("mdl-menu__item--profile");
var signout_btn = document.getElementById("mdl-menu__item--signout");
// Add rule button is to proceed to the "Add Rule" page to add a rule.
var add_rule_btn = document.getElementById("firewall-rule__button--add");
// Delete button is to delete an existing rule.
var delete_rule_btn = document.getElementById("firewall-rule__button--delete");
// Update button is to create/edit a new rule.
var update_rule_btn = document.querySelector(".firewall-button--update");
// Cancel button is to cancel the rule creation process.
var cancel_rule_btn = document.querySelector(".firewall-button--cancel");
// Profile Display
var acc_prof_name = document.getElementById("account-profile--display-name");
var acc_prof_org = document.getElementById("account-profile--display-org");
var acc_prof_email = document.getElementById("account-profile--input-email");
var acc_prof_phone = document.getElementById("account-profile--input-phone");

// Set up path prefix i.e. '../' (for urls links in button actions)
var path_prefix = "/";

/**
 * Generic functions
 */
var InputValidator = function() {};
InputValidator.isEmpty = function(input) {
    return input === "" || typeof input === "undefined" || input === null;
};
InputValidator.isAReasonablyStrongPassword = function(input) {
    const re = new RegExp('^(?=.{2,}[a-z])(?=.{2,}[A-Z])(?=.{2,}[0-9])(?=.+[!@#$%^&*])(?=.{8,})', 'u');
    return re.test(input);
};
InputValidator.isValidOrgName = function(input) {
    const re = /^[A-Za-z0-9 .,()]{3,30}$/;
    return re.test(input);
};
InputValidator.isValidEmail = function(input) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(input);
};
InputValidator.isValidPhoneNum = function(input) {
    const re = /^[89]+\d{7}$/;
    return re.test(input);
};
InputValidator.isValidPortNum = function(input) {
    if (InputValidator.isNum(input)) {
        var port = parseInt(input, 10);
        return (port >= 0 && port <= 65535) ? true : false;
    }
    return input === "*";
};
InputValidator.isValidRuleName = function(input) {
    const re = /^[A-Za-z0-9]{3,10}$/;
    return re.test(input);
};
InputValidator.isNum = function(input) {
    try {
        const int = parseInt(input);
        return !isNaN(int);
    } catch (error) {
        return false;
    }
};
InputValidator.isValidIp = function(input) {
    const re = /^(?=[\d\*]+\.[\d\*]\.[\d\*]\.[\d\*]$)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9]|\*)\.?){4}$/;
    return re.test(input);
};

function showSnackbar(message, actionText, actionHandler) {
    var notification = document.querySelector('.mdl-js-snackbar');
    var data = {
        message: message,
        timeout: 10000
    };
    if (!InputValidator.isEmpty(actionText)) {
        data.actionText = actionText;
        data.actionHandler = actionHandler;
    }
    if (notification.getAttribute('aria-hidden') !== "false")
        notification.MaterialSnackbar.showSnackbar(data);
}

function update_text_field_ui(el, valid) {
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
}

// Set actions for buttons
if (!InputValidator.isEmpty(rule_btn)) rule_btn.href = "/";

if (!InputValidator.isEmpty(profile_btn)) {
    profile_btn.addEventListener('click', function() {
        location.href = "/profile";
    });
}

function retrieveProfile(uid) {
    return axios({
        url: '/account-retrieve-basic',
        method: 'POST',
        headers: {
            'Authorisation': 'Bearer ' + uid
        }
    });
}

function stillAnyInvalid() {
    var anyFieldIsInvalid = false;
    document.querySelectorAll('.mdl-textfield')
    .forEach(function(input) {
        if (input.classList.contains('is-invalid')) {
            showSnackbar("Please check your input and try again.");
            anyFieldIsInvalid = true;
        }
    });
    return anyFieldIsInvalid;
}