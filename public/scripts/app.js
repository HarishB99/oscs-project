// Side panel buttons
var home_btn = document.getElementById("mdl-navigation__link--home");
var rule_btn = document.getElementById("mdl-navigation__link--rules");
// Side panel menu button
var profile_btn = document.getElementById("mdl-menu__item--profile");
var signout_btn = document.getElementById("mdl-menu__item--signout");
var port_inputs = document.querySelectorAll(".rule__ports");
// Add rule button is to proceed to the "Add Rule" page to add a rule.
var add_rule_btn = document.getElementById("firewall-rule__button--add");
// Delete button is to delete an existing rule.
var delete_rule_btn = document.getElementById("firewall-rule__button--delete");
// Update button is to create/edit a new rule.
var update_rule_btn = document.querySelector(".firewall-button--update");
// Cancel button is to cancel the rule creation process.
var cancel_rule_btn = document.querySelector(".firewall-button--cancel");
// Account Request button
var acc_req_btn = document.getElementById("account-create--button-submit");
var acc_req_email = document.getElementById("account-create--input-email");
var acc_req_org = document.getElementById("account-create--input-org");
var acc_req_phone = document.getElementById("account-create--input-phone");
var acc_req_pass = document.getElementById("account-create--input-password");
var acc_req_pass2 = document.getElementById("account-create--input-password2");
// Account Login button
var acc_login_btn = document.getElementById("account-login--button");

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

/**
 * Account creation functions
 */

// Set actions for buttons
if (home_btn) home_btn.href = "/";
if (rule_btn) rule_btn.href = "/firewall";

if (profile_btn) {
    profile_btn.addEventListener('click', function() {
        location.href = "/profile";
    });
}



function isAValidPort(e) {
    var childEl = e.target;
    var el = childEl.parentElement;
    // var port_enterd = el.value;
    var parsed_port = 0;
    try {
        parsed_port = parseInt(childEl.value);
        if (isNaN(childEl.value)) {
            throw 'still not a number';
        }
    } catch (error) {
        return el.classList.add("is-invalid");
    }
    if (parsed_port < 0 || parsed_port > 65535) return el.classList.add("is-invalid");
    if (el.classList.contains("is-invalid")) return el.classList.remove("is-invalid");
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

function signInWithEmailPass() {

}

function updateRule() {

}

function addRule() {

}

function deleteRule() {
    
}

if (add_rule_btn) {
    add_rule_btn.onclick = function(e) {
        location.href = "/contents/rules/rule.html";
    };
}

if (update_rule_btn) {
    update_rule_btn.onclick = function(el) {
        location.href = "/contents/rules/rule.html";
    };
}

if (cancel_rule_btn) {
    cancel_rule_btn.onclick = function(e) {
        location.href = "/contents/firewall.html";
    };
}

if (acc_req_btn) {
    acc_req_btn.addEventListener("click", function(e) {
        // TODO: Make sure input passes validation
        axios.post("/account-create", {
            email: acc_req_email.value,
            org: acc_req_org.value,
            contact: acc_req_phone.value,
            pass: acc_req_pass.value
        }).then(function(response) {
            if (response.data.toLowerCase() === "account request: created") {
                // TODO: On Success
                location.replace('/contents/accounts/login.html');
            } else {
                showSnackbar("Please check your input and try again. If the problem persist, please close the browser and try again.");
            }
        })['catch'](function(error) {
            console.error("Error while performing account creation request: ", error);
            if (error.message === "Network Error") {
                showSnackbar("Please check your network connection and try again.");
            } else if (error.message.search('404') >= 0) {
                showSnackbar("Sorry. The functionality has not been enabled yet.");
            } else {
                showSnackbar("An unexpected error occurred. Please try again later.");
            }
        });
    });
}





if (acc_login_btn) {
    acc_login_btn.addEventListener('click', function(e) {
        var email = document.getElementById('username').value;
        var password = document.getElementById('pass').value;
        // TODO: If possible, validate the input
        firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function() {
            console.log('User logged in');
            // TODO: What happens next after user logs in
            location.replace('/');
        })['catch'](function(error) {
            console.error(error);
            if (error.code === "auth/user-not-found") {
                showSnackbar("Your email does not match our records.", "Create Account", function(e) {
                    location.href = '/contents/accounts/account.html';
                });
            } else if (error.code === "auth/user-disabled") {
                showSnackbar("Your account has been disabled. Please try again later.");
            } else if (error.code === "auth/wrong-password" || error.code === "auth/invalid-email") {
                showSnackbar("Invalid Credentials. Please try again.");
            }
        });
    });
}




/**
 * Account Creation
 */
if (acc_req_pass) {
    // acc_req_pass.addEventListener('focus', function(e) {
    //     if (InputValidator.isAReasonablyStrongPassword(acc_req_pass.value)) {
    //         if (acc_req_pass.parentElement.className.search("is-invalid") >= 0) {
    //             var acc_req_pass_parent = acc_req_pass.parentElement;
    //             acc_req_pass_parent.className = acc_req_pass_parent.className.replace(" is-invalid", "");
    //         }
    //     } else {
    //         if (acc_req_pass.parentElement.className.search("is-invalid") < 0) {
    //             acc_req_pass.parentElement.className += " is-invalid";
    //         }
    //     }
    // });

    acc_req_pass.addEventListener('keyup', function(e) {
        if ( InputValidator.isAReasonablyStrongPassword(acc_req_pass.value)) {
            if (acc_req_pass.parentElement.className.search("is-invalid") >= 0) {
                var acc_req_pass_parent = acc_req_pass.parentElement;
                acc_req_pass_parent.className = acc_req_pass_parent.className.replace(" is-invalid", "");
            }
        } else {
            if (acc_req_pass.parentElement.className.search("is-invalid") < 0) {
                acc_req_pass.parentElement.className += " is-invalid";
            }
        }
    });
}

if (acc_req_pass2) {
    acc_req_pass2.addEventListener('keyup', function(e) {
        if (acc_req_pass2.value === acc_req_pass.value) {
            if (acc_req_pass2.parentElement.className.search("is-invalid") >= 0) {
                var acc_req_pass2_parent = acc_req_pass2.parentElement;
                acc_req_pass2_parent.className = acc_req_pass2_parent.className.replace(" is-invalid", "");
            }
        } else {
            if (acc_req_pass2.parentElement.className.search("is-invalid") < 0) {
                acc_req_pass2.parentElement.className += " is-invalid";
            }
        }
    });
}