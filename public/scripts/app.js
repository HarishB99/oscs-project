var home_btn = document.getElementById("mdl-navigation__link--home");
var rule_btn = document.getElementById("mdl-navigation__link--rules");
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

// Set up path prefix i.e. '../' (for urls links in button actions)
var path_prefix = "/";

// Set actions for buttons
if (home_btn) home_btn.href = "/";
if (rule_btn) rule_btn.href = "/contents/firewall.html";

function showSnackbar(message) {
    var notification = document.querySelector('.mdl-js-snackbar');
    var data = {
        message: message,
        // actionHandler: function(event) {},
        // actionText: 'Undo',
        timeout: 10000
    };
    if (notification.getAttribute('aria-hidden') !== "false")
        notification.MaterialSnackbar.showSnackbar(data);
}

function isAValidPort(el) {
    // var port_enterd = el.value;
    var parsed_port = 0;
    try {
        parsed_port = parseInt(el.value);
    } catch (error) {
        return el.classList.add("is-invalid");
    }
    if (parsed_port < 0 || parsed_port > 65535) return el.classList.add("is-invalid");
    if (el.classList.contains("is-invalid")) return el.classList.remove("is-invalid");
}

function retrieveProfile() {
    return axios.post("/profile-retrieve").then(function(response) {
        return JSON.response(response.data);
    });
}

function signInWithEmailPass() {

}

function retrieveRules() {
    return Ajax.post("/rules.json");
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
        console.log({
            email: acc_req_email.value,
            org: acc_req_org.value,
            contact: acc_req_phone.value
        });
        axios.post("/account-create-request", {
            email: acc_req_email.value,
            org: acc_req_org.value,
            contact: acc_req_phone.value
        }).then(response => {
            if (response.data.toLowerCase() === "account request: created") {
                // TODO: On Success
            } else {
                showSnackbar("Please check your input and try again. If the problem persist, please close the browser and try again.");
            }
        }).catch(error => {
            console.error("Error while performing account creation request: ", error);
            if (error.message === "Network Error") {
                showSnackbar("Please check your network connection and try again.");
            } else if (error.message.search('404') >= 0) {
                showSnackbar("Sorry. The functionality has not been enabled yet.");
            } else {
                showSnackbar("An unexpected error occurred. Please try again later.");
            }
        })
    });
}