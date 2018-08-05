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
        
        const rule_delete_name_retrieved = document.getElementById('rule--name-original');
        const rule_delete_name = document.getElementById('rule--name');
        const rule_delete_btn = document.getElementById('rule-button--delete');

        if (!user.emailVerified) {
            rule_delete_name.disabled = true;
            UIUtils.showSnackbar('Please verify your email before you proceed to manage your firewall proxy.');
        }

        rule_delete_btn.disabled = true;

        var checkAllInputs = function() {
            UIUtils.update_text_field_ui(rule_delete_name, 
                rule_delete_name.value === rule_delete_name_retrieved.innerHTML);
            if (rule_delete_name.value === rule_delete_name_retrieved.innerHTML) {
                rule_delete_btn.disabled = false;
            } else {
                rule_delete_btn.disabled = true;
            }
        };
        
        /* ::Add keyboard event listeners to validate text fields:: */
        rule_delete_name.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.currentTarget, 
                e.currentTarget.value === rule_delete_name_retrieved.innerHTML);
            if (e.currentTarget.value === rule_delete_name_retrieved.innerHTML) {
                rule_delete_btn.disabled = false;
            } else {
                rule_delete_btn.disabled = true;
            }
        });
        /* ::Add keyboard event listeners to validate text fields:: */
        
        document.addEventListener('keyup', e => {
            if (e.keyCode === 13) rule_delete_btn.click();
        });

        rule_delete_btn.addEventListener('click', () => {
            if (lock || !(user.emailVerified)) return; lock = true;
            checkAllInputs();
            
            if (UIUtils.stillAnyInvalid()) return;

            user.getIdToken(true)
            .then(token => {
                return axios.post(
                    '/rule-delete', 
                    {
                        id: document.querySelector('.id').id
                    }, 
                    {
                        headers: {
                            'Authorisation': 'Bearer ' + token,
                            'Content-Type': 'application/json'
                        }
                    }
                )
            }).then(response => {
                const payload = response.data;
                if (payload.code === 'rule/delete-success') {
                    location.replace('/#firewall-rule');
                } else {
                    UIUtils.showSnackbar(payload.message);
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