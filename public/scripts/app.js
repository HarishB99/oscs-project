var home_btn = document.querySelector(".btn--home");
var rule_btn = document.querySelector(".btn--rules");
var port_inputs = document.querySelectorAll(".rule__ports");
// Add rule button is to proceed to the "Add Rule" page to add a rule.
var add_rule_btn = document.querySelector(".firewall-button--add");
// Delete button is to delete an existing rule.
var delete_rule_btn = document.querySelector(".firewall-button--delete");
// Publish button is to publish changes to the firewall.
var publish_rule_btn = document.querySelector(".firewall-button--publish");
// Update button is to create/edit a new rule. 
// Must be explicitly published using the publish button.
var update_rule_btn = document.querySelector(".firewall-button--update");
// Cancel button is to cancel the rule creation process.
var cancel_rule_btn = document.querySelector(".firewall-button--cancel");

// Set up path prefix i.e. '../' (for urls links in button actions)
var path_prefix = "/";

// Set actions for buttons
if (home_btn !== null) home_btn.href = "/";
if (rule_btn !== null) rule_btn.href = "/contents/firewall.html";



function isAValidPort(el) {
    var port_enterd = el.value;
    var parsed_port = 0;
    try {
        parsed_port = parseInt(el.value);
    } catch (error) {
        el.classList.add("is-invalid");
    }
    if (parsed_port < 0 || parsed_port > 65535) {
        el.classList.add("is-invalid");
        return;
    }
    if (el.classList.contains("is-invalid")) {
        el.classList.remove("is-invalid");
    }
}

if (add_rule_btn !== null) {
    add_rule_btn.onclick = function(e) {
        location.href = "/contents/rules/rule.html";
    };
}

if (update_rule_btn !== null) {
    update_rule_btn.onclick = function(el) {
        // localStorage["edit_rule_name"]
        location.href = "/contents/rules/rule.html";
    };
}

if (cancel_rule_btn !== null) {
    cancel_rule_btn.onclick = function(e) {
        location.href = "/contents/firewall.html";
    };
}