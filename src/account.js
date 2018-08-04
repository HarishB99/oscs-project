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

let wasntAlreadyLoggedIn = false;

firebase.auth().onAuthStateChanged(user => {
    if (!InputValidator.isEmpty(user)) {
        if (!wasntAlreadyLoggedIn) {
            location.replace('/');
        } else {
            user.sendEmailVerification()
            .then(() => location.replace('/login'))
            .catch(() => {
                location.replace('/login');
            });
        }
    } else {
        wasntAlreadyLoggedIn = true;
        let lock = false;
        const acc_req_email = document.getElementById("account-create--input-email");
        const acc_req_pass = document.getElementById("account-create--input-password");
        const pass2 = document.getElementById("account-create--input-password2");
        const acc_req_btn = document.getElementById("account-create--button-submit");
        const acc_login_btn = document.getElementById('account-login--button');

        acc_login_btn.addEventListener('click', () => {
            if (lock) return; lock = true;
            location.href = '/login';            
            lock = false;
        });

        var checkAllInputs = function () {
            UIUtils.update_text_field_ui(acc_req_email, 
                InputValidator.isValidEmail(acc_req_email.value));
            UIUtils.update_text_field_ui(acc_req_pass, 
                InputValidator.isAReasonablyStrongPassword(acc_req_pass.value));
            UIUtils.update_text_field_ui(pass2, 
                (acc_req_pass.value === pass2.value && pass2.value !== ''));
        };

        /* ::Add keyboard event listeners to validate text fields:: */
        acc_req_email.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidEmail(e.target.value));
        });

        acc_req_pass.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isAReasonablyStrongPassword(e.target.value));
        });

        pass2.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                (acc_req_pass.value === e.target.value && e.target.value !== ''));
        });
        /* ::Add keyboard event listeners to validate text fields:: */

        document.addEventListener('keyup', e => {
            if (e.keyCode === 13) acc_req_btn.click();
        });

        acc_req_btn.addEventListener("click", () => {
            if (lock) return; lock = true;
            checkAllInputs();
            
            if (UIUtils.stillAnyInvalid()) return;

            firebase.auth()
            .createUserWithEmailAndPassword(
                acc_req_email.value, acc_req_pass.value)
            .catch(error => {
                if (error.code === 'auth/email-already-in-use') {
                    location.replace('/login');
                } else if (error.code === "auth/weak-password" || error.code === "auth/invalid-email") {
                    UIUtils.showSnackbar("Please check your input and try again.");
                } else if (error.code === 'auth/invalid-user-token' || error.code === 'auth/user-token-expired' || error.code === 'auth/user-disabled' || error.code === 'auth/user-not-found') {
                    location.replace('/login');
                } else if (error.code === 'auth/network-request-failed' || error.message === 'Network Error') {
                    UIUtils.showSnackbar('Please check your network connection and try again.');
                } else {
                    UIUtils.showSnackbar('An unexpected error occurred. Please try again later.');
                }
                lock = false;
            });
        });
    }
});