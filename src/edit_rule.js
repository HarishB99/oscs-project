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
                if (error.code === 'auth/network-request-failed') {
                    UIUtils.showSnackbar('Please check your network connection and try again.');
                } else {
                    UIUtils.showSnackbar('Please clear your browser cache or restart your browser, and try again.');
                }
                lock = false;
            });
        });

        firewall_policies_btn.addEventListener('click', () => {
            if (lock) return; lock = true;
            location.href = '/';
            lock = false
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

        if (!user.emailVerified) {
            rule_edit_name.disabled = true;
            rule_edit_access.disabled = true;
            rule_edit_proto_inputs.disabled = true;
            rule_edit_priority.disabled = true;
            rule_edit_sip.disabled = true;
            rule_edit_sport.disabled = true;
            rule_edit_dip.disabled = true;
            rule_edit_dport.disabled = true;
            rule_edit_direction.disabled = true;
            rule_edit_btn.disabled = true;
            UIUtils.showSnackbar('Please verify your email before you proceed to manage your firewall proxy.');
        }
        
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
        rule_edit_name.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidRuleName(e.target.value));
        });
        
        rule_edit_priority.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidPriorityNum(e.target.value));
        });
        
        rule_edit_sip.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidIp(e.target.value));
        });
        
        rule_edit_sport.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidPortNum(e.target.value));
        });
        
        rule_edit_dip.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidIp(e.target.value));
        });
        
        rule_edit_dport.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidPortNum(e.target.value));
        });
        /* ::Add keyboard event listeners to validate text fields:: */
        
        document.addEventListener('keyup', e => {
            if (e.keyCode === 13) rule_edit_btn.click();
        });
        
        rule_edit_btn.addEventListener('click', () => {
            if (lock || !(user.emailVerified)) return; lock = true;
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
                        direction: rule_edit_direction.checked.toString(),
                        id: document.querySelector('.id').id
                    }
                });
            }).then(response => {
                if (response.data.code === 'rule/update-success') {
                    location.replace('/#firewall-rule');
                } else {
                    UIUtils.showSnackbar(response.data.message);
                }
                lock = false;
            }).catch(error => {
                if (error.code === 'auth/invalid-user-token' || error.code === 'auth/user-token-expired' || error.code === 'auth/user-disabled') {
                    firebase.auth().signOut()
                    .catch(() => {
                        UIUtils.showSnackbar('Your have to logout and login again to perform this action.');
                        lock = false;
                    });
                } else if (error.code === 'auth/network-request-failed' || error.message === 'Network Error') {
                    UIUtils.showSnackbar('Please check your network connection and try again.');
                } else {
                    UIUtils.showSnackbar('An unexpected error occurred. Please try again later.');
                }
                lock = false;
            });
        });
    } else { UIUtils.logoutUI(); }
});