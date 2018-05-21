var home_btns = document.querySelectorAll(".btn--home");
var rule_btns = document.querySelectorAll(".btn--rules");

// Set up path prefix i.e. '../' (for urls links in button actions)
var path_prefix = "/";
// if (location.pathname.endsWith("index.html")) path_prefix = "";

// Set actions for buttons
if (home_btns.length !== 0) 
    for (var i in home_btns) home_btns[i].href = path_prefix + "index.html";
if (rule_btns.length !== 0) 
    for (var i in rule_btns) rule_btns[i].href = path_prefix + "contents/firewall.html";