require('babel-polyfill');

// Firebase libraries
const firebase = require('firebase/app');
require('firebase/auth');

// Initialise firebase
const config = require('./modules/config').config;
firebase.initializeApp(config);

// Import other custom libraries
const InputValidator = require('./modules/InputValidator').default;
const UIUtils = require('./modules/UIUtils').default;

let wasAlreadyLoggedIn = false;

firebase.auth().onAuthStateChanged(user => {
    if (!InputValidator.isEmpty(user)) {
        wasAlreadyLoggedIn = true;
        let lock = false;
        const actionCode = document.querySelector('.id').id;

        firebase.auth().applyActionCode(actionCode)
        .then(() => {
            firebase.auth().signOut();
        }).then(() => {
            const form_holder_container = document.getElementById('form-holder--container');
            const acc_rst_pass_status = document.getElementById('account-rst-pass--status');
            const buttons_holder = document.getElementById('buttons-holder');
            const account_login_btn = document.getElementById('account-login--button');

            acc_rst_pass_status.innerHTML = 'Success!';
            acc_rst_pass_status.parentElement.classList.remove('mdl-color-text--amber');
            if (!acc_rst_pass_status.parentElement.classList.contains('mdl-color-text--green'))
                acc_rst_pass_status.parentElement.classList.add('mdl-color-text--green');
            
            const span = document.createElement('span');
            span.innerHTML = 'Your email has been verified. Please login to refresh your profile information.';
            form_holder_container.appendChild(span);

            // buttons_holder.style.display = 'block';
            buttons_holder.classList.remove('visually-hidden');

            account_login_btn.addEventListener('click', () => {
                if (lock) return; lock = true;
                location.replace('/login');
                lock = false;
            });
        }).catch(error => {
            if (error.code === 'auth/expired-action-code' || error.code === 'auth/invalid-action-code') {
                user.sendEmailVerification()
                .then(() => {
                    UIUtils.showSnackbar('The link has expired. We have just sent you another link to your email. Please click on it to verify your email.');
                }).catch(err => {
                    if (err.code === 'auth/user-mismatch' || err.code === "auth/invalid-email" || err.code === 'auth/invalid-user-token' || err.code === 'auth/user-token-expired' || err.code === 'auth/user-disabled' || err.code === 'auth/user-not-found') {
                        firebase.auth().signOut()
                        .catch(() => {
                            UIUtils.showSnackbar('Your have to logout and login again to perform this action.');
                            lock = false;
                        });
                    } else if (err.code === 'auth/network-request-failed' || err.message === 'Network Error') {
                        UIUtils.showSnackbar('Please check your network connection and try again.');
                    } else {
                        UIUtils.showSnackbar('An unexpected error occurred. Please try again later.');
                    }
                });
            } else if (error.code === 'auth/invalid-user-token' || error.code === 'auth/user-token-expired' || error.code === 'auth/user-disabled' || error.code === 'auth/user-not-found') {
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
        });
    } else { 
        if (!wasAlreadyLoggedIn) {
            UIUtils.logoutUI();
        }
    }
});