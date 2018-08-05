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

const unsubscribe = firebase.auth().onAuthStateChanged(user => {
    if (!InputValidator.isEmpty(user)) {
        location.replace('/');
    } else {
        let lock = false;
        const acc_login_btn = document.getElementById("account-login--button");
        const acc_login_email = document.getElementById("account-login--email");
        const acc_login_pass = document.getElementById("account-login--pass");
        const acc_create_btn = document.getElementById('account-create--button');
        const acc_rst_pass_btn = document.getElementById('account-rst-pass--button');

        acc_create_btn.addEventListener('click', () => {
            if (lock) return; lock = true;
            location.href = '/create_account';
            lock = false
        });

        acc_rst_pass_btn.addEventListener('click', () => {
            if (lock) return; lock = true;
            location.href = '/forgot_password';
            lock = false;
        });
        
        var checkAllInputs = function() {
            UIUtils.update_text_field_ui(acc_login_email, 
                InputValidator.isValidEmail(acc_login_email.value));
            UIUtils.update_text_field_ui(acc_login_pass, 
                InputValidator.isAReasonablyStrongPassword(acc_login_pass.value));
        };
        
        /* ::Add keyboard event listeners to validate text fields:: */
        acc_login_email.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidEmail(e.target.value));
        });
        
        acc_login_pass.addEventListener('keyup', () => {
            UIUtils.update_text_field_ui(acc_login_pass, 
                InputValidator.isAReasonablyStrongPassword(acc_login_pass.value));
        });
        /* ::Add keyboard event listeners to validate text fields:: */
        
        document.addEventListener('keyup', e => {
            if (e.keyCode === 13) acc_login_btn.click();
        });
        
        acc_login_btn.addEventListener('click', () => {
            if (lock) return; lock = true;
            checkAllInputs();
        
            if (UIUtils.stillAnyInvalid()) return;
        
            unsubscribe();

            firebase.auth().signInWithEmailAndPassword(
                acc_login_email.value, acc_login_pass.value)
            .then(() => location.replace('/')).catch(error => {
                if (error.code === 'auth/user-not-found') {
                    UIUtils.showSnackbar("Your email does not match our records.", "Create Account", () => {
                        location.href = '/create_account';
                    });
                } else if (error.code === 'auth/network-request-failed' || error.message === 'Network Error') {
                    UIUtils.showSnackbar('Please check your network connection and try again.');
                } else if (error.code === "auth/user-disabled") {
                    UIUtils.showSnackbar('Your account has been disabled. Please try again later.');
                } else if (error.code === "auth/wrong-password" || error.code === "auth/invalid-email") {
                    acc_login_email.value = '';
                    if (acc_login_email.parentElement.classList.contains('is-dirty'))
                        acc_login_email.parentElement.classList.remove('is-dirty');
                    if (acc_login_email.parentElement.classList.contains('is-focused'))
                        acc_login_email.parentElement.classList.remove('is-focused');
                    if (!acc_login_email.parentElement.classList.contains('is-invalid'))
                        acc_login_email.parentElement.classList.add('is-invalid');
                    acc_login_pass.value = '';
                    if (acc_login_pass.parentElement.classList.contains('is-dirty'))
                        acc_login_pass.parentElement.classList.remove('is-dirty');
                    if (acc_login_pass.parentElement.classList.contains('is-focused'))
                        acc_login_pass.parentElement.classList.remove('is-focused');
                    if (!acc_login_pass.parentElement.classList.contains('is-invalid'))
                        acc_login_pass.parentElement.classList.add('is-invalid');
                    UIUtils.showSnackbar("Invalid Credentials. Please try again.");
                } else {
                    UIUtils.showSnackbar("An unexpected error occurred. Please try again later.");
                }
                lock = false;
            });
        });
    }
});