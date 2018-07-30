require('babel-polyfill');

// Firebase libraries
const firebase = require('firebase/app');
require('firebase/auth');

// Initialise firebase
const config = require('./modules/config').config;
firebase.initializeApp(config);

// Import other custom libraries
const axios = require('axios');
const InputValidator = require('./modules/InputValidator').default;
const UIUtils = require('./modules/UIUtils').default;

firebase.auth().onAuthStateChanged(user => {
    if (!InputValidator.isEmpty(user)) {
        let lock = false;
        const email_display = document.getElementById('mdl-drawer--email');
        const profile_btn = document.getElementById('mdl-menu__item--profile');
        const signout_btn = document.getElementById('mdl-menu__item--signout');
        const firewall_policies_btn = document.getElementById('mdl-navigation__link--rules');
        
        email_display.innerHTML = user.displayName;
        
        profile_btn.addEventListener('click', () => {
            if (lock) return; lock = true;
            location.href = '/profile';
            lock = false;
        });
        
        signout_btn.addEventListener('click', () => {
            if (lock) return; lock = true;
            firebase.auth().signOut()
            .catch(error => {
                console.error('Error while signing out user: ', error);
                UIUtils.showSnackbar('Please clear your browser cache or restart your browser, and try again.');
                lock = false;
            });
        });

        firewall_policies_btn.addEventListener('click', () => {
            if (lock) return; lock = true;
            location.href = '/';
            lock = false
        });
        
        const rule_create_name = document.getElementById('rule--name');
        const rule_create_access = document.getElementById('rule--access');
        const rule_create_proto_inputs = document.querySelectorAll('input[name="proto"]');
        const rule_create_priority = document.getElementById('rule--priority');
        const rule_create_sip = document.getElementById('rule--source-ip');
        const rule_create_sport = document.getElementById('rule--source-port');
        const rule_create_dip = document.getElementById('rule--dest-ip');
        const rule_create_dport = document.getElementById('rule--dest-port');
        const rule_create_direction = document.getElementById('rule--direction');
        const rule_create_btn = document.getElementById('rule-button--update');
        
        var checkAllInputs = function () {
            UIUtils.update_text_field_ui(rule_create_name, 
                InputValidator.isValidRuleName(rule_create_name.value));
            UIUtils.update_text_field_ui(rule_create_priority, 
                InputValidator.isValidPriorityNum(rule_create_priority.value));
            UIUtils.update_text_field_ui(rule_create_sip, 
                InputValidator.isValidIp(rule_create_sip.value));
            UIUtils.update_text_field_ui(rule_create_sport, 
                InputValidator.isValidPortNum(rule_create_sport.value));
            UIUtils.update_text_field_ui(rule_create_dip, 
                InputValidator.isValidIp(rule_create_dip.value));
            UIUtils.update_text_field_ui(rule_create_dport, 
                InputValidator.isValidPortNum(rule_create_dport.value));
        };
        
        /* ::Add keyboard event listeners to validate text fields:: */
        rule_create_name.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidRuleName(e.target.value));
        });
        
        rule_create_priority.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidPriorityNum(e.target.value));
        });
        
        rule_create_sip.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidIp(e.target.value));
        });
        
        rule_create_sport.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidPortNum(e.target.value));
        });
        
        rule_create_dip.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidIp(e.target.value));
        });
        
        rule_create_dport.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidPortNum(e.target.value));
        });
        /* ::Add keyboard event listeners to validate text fields:: */
        
        document.addEventListener('keyup', e => {
            if (e.keyCode === 13) rule_create_btn.click();
        });
        
        rule_create_btn.addEventListener('click', () => {
            if (lock) return; lock = true;
            checkAllInputs();
            
            if (UIUtils.stillAnyInvalid()) return;
            
            let rule_create_proto = null;

            for (let i = 0; i < rule_create_proto_inputs.length; i++) {
                if (rule_create_proto_inputs[i].checked) {
                    rule_create_proto = rule_create_proto_inputs[i].value;
                }
            }

            user.getIdToken(true)
            .then(token => {
                return axios({
                    url: '/rule-create',
                    method: 'POST',
                    headers: {
                        'Authorisation': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    data: {
                        name: rule_create_name.value,
                        access: rule_create_access.checked.toString(),
                        priority: rule_create_priority.value,
                        proto: rule_create_proto,
                        sip: rule_create_sip.value,
                        sport: rule_create_sport.value,
                        dip: rule_create_dip.value,
                        dport: rule_create_dport.value,
                        direction: rule_create_direction.checked.toString()
                    }
                });
            }).then(response => {
                // console.log(response.data);
                if (response.data.code === 'rule/creation-success') {
                    location.replace('/#firewall-rule');
                } else {
                    UIUtils.showSnackbar(response.data.message);
                }
                lock = false;
            }).catch(error => {
                console.error("Error while performing rule creation request: ", error);
                if (error.message === "Network Error") {
                    UIUtils.showSnackbar("Please check your network connection and try again.");
                } else {
                    UIUtils.showSnackbar("An unexpected error occurred. Please try again later.");
                }
                lock = false;
            });
        });
    } else { UIUtils.logoutUI(); }
});