require('babel-polyfill');

// Firebase libraries
const firebase = require('firebase/app');
require('firebase/auth');

// Initialise firebase
const config = require('./modules/config').config;
firebase.initializeApp(config);

// Import other custom libraries
const axios = require('axios').default;
const InputValidator = require('./modules/InputValidator').default;
const UIUtils = require('./modules/UIUtils').default;

firebase.auth().onAuthStateChanged(user => {
    if (!InputValidator.isEmpty(user)) {
        const email_display = document.getElementById('mdl-drawer--email');
        const profile_btn = document.getElementById('mdl-menu__item--profile');
        const signout_btn = document.getElementById('mdl-menu__item--signout');
        
        email_display.innerHTML = user.email;
        
        profile_btn.addEventListener('click', () => {
            location.href = '/profile';
        });
        
        signout_btn.addEventListener('click', () => {
            firebase.auth().signOut()
            .then(() => {
                location.replace('/login');
            })
            .catch(error => {
                console.error('Error while signing out user: ', error);
                UIUtils.showSnackbar('An unexpected error occurred. Please clear your browser cache, restart your browser and try again.');
            });
        });
        
        const rule_edit_name = document.getElementById('rule--name');
        const rule_edit_access = document.getElementById('rule--access');
        const rule_edit_proto_inputs = document.querySelectorAll('input[name="proto"]');
        const rule_edit_priority = document.getElementById('rule--priority');
        const rule_edit_sip = document.getElementById('rule--source-ip');
        const rule_edit_sport = document.getElementById('rule--source-port');
        const rule_edit_dip = document.getElementById('rule--dest-ip');
        const rule_edit_dport = document.getElementById('rule--dest-port');
        const rule_edit_direction = document.getElementById('rule--direction');
        const rule_edit_btn = document.getElementById('rule-button--update');
        
        var checkAllInputs = function() {
            UIUtils.update_text_field_ui(rule_edit_name, 
                InputValidator.isValidRuleName(rule_edit_name.value));
            UIUtils.update_text_field_ui(rule_edit_priority, 
                InputValidator.isValidPriorityNum(rule_edit_priority.value));
            UIUtils.update_text_field_ui(rule_edit_sip, 
                InputValidator.isValidIp(rule_edit_sip.value));
            UIUtils.update_text_field_ui(rule_edit_sport, 
                InputValidator.isValidPortNum(rule_edit_sport.value));
            UIUtils.update_text_field_ui(rule_edit_dip, 
                InputValidator.isValidIp(rule_edit_dip.value));
            UIUtils.update_text_field_ui(rule_edit_dport, 
                InputValidator.isValidPortNum(rule_edit_dport.value));
        };
        
        checkAllInputs();
        
        /* ::Add keyboard event listeners to validate text fields:: */
        rule_edit_name.addEventListener('focus', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidRuleName(e.target.value));
        }); rule_edit_name.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidRuleName(e.target.value));
        });
        
        rule_edit_priority.addEventListener('focus', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidPriorityNum(e.target.value));
        }); rule_edit_priority.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidPriorityNum(e.target.value));
        });
        
        rule_edit_sip.addEventListener('focus', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidIp(e.target.value));
        }); rule_edit_sip.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidIp(e.target.value));
        });
        
        rule_edit_sport.addEventListener('focus', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidPortNum(e.target.value));
        }); rule_edit_sport.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidPortNum(e.target.value));
        });
        
        rule_edit_dip.addEventListener('focus', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidIp(e.target.value));
        }); rule_edit_dip.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidIp(e.target.value));
        });
        
        rule_edit_dport.addEventListener('focus', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidPortNum(e.target.value));
        }); rule_edit_dport.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidPortNum(e.target.value));
        });
        /* ::Add keyboard event listeners to validate text fields:: */
        
        document.addEventListener('keyup', e => {
            if (e.keyCode === 13) rule_edit_btn.click();
        });
        
        rule_edit_btn.addEventListener('click', () => {
            checkAllInputs();
            
            if (UIUtils.stillAnyInvalid()) return;
            
            let rule_edit_proto = null;

            for (let i = 0; i < rule_edit_proto_inputs.length; i++) {
                if (rule_edit_proto_inputs[i].checked) {
                    rule_edit_proto = rule_edit_proto_inputs[i].value;
                }
            }

            user.getIdToken(true)
            .then(token => {
                return axios({
                    url: '/rule-update',
                    method: 'POST',
                    headers: {
                        'Authorisation': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    data: {
                        name: rule_edit_name.value,
                        access: rule_edit_access.checked.toString(),
                        priority: rule_edit_priority.value,
                        proto: rule_edit_proto,
                        sip: rule_edit_sip.value,
                        sport: rule_edit_sport.value,
                        dip: rule_edit_dip.value,
                        dport: rule_edit_dport.value,
                        direction: rule_edit_direction.checked.toString()
                    }
                });
            }).then(response => {
                // console.log(response.data);
                if (response.data.code === 'rule/update-success') {
                    location.replace('/#firewall-rule');
                } else {
                    UIUtils.showSnackbar(response.data.message);
                }
            }).catch(error => {
                console.error("Error while performing rule update request: ", error);
                if (error.message === "Network Error") {
                    UIUtils.showSnackbar("Please check your network connection and try again.");
                } else {
                    UIUtils.showSnackbar("An unexpected error occurred. Please try again later.");
                }
            });
        });
    } else { UIUtils.logoutUI(); }
});