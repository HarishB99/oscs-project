var home_btns = document.querySelectorAll(".btn--home");
var rule_btns = document.querySelectorAll(".btn--rules");
var port_inputs = document.querySelectorAll(".rule__ports");

// Set up path prefix i.e. '../' (for urls links in button actions)
var path_prefix = "/";
// if (location.pathname.endsWith("index.html")) path_prefix = "";

// Set actions for buttons
if (home_btns.length !== 0) 
    for (var i in home_btns) home_btns[i].href = path_prefix + "index.html";
if (rule_btns.length !== 0) 
    for (var i in rule_btns) rule_btns[i].href = path_prefix + "contents/firewall.html";

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