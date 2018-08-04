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

firebase.auth().onAuthStateChanged(user => {
    if (!InputValidator.isEmpty(user)) {
        location.replace('/');
    } else {
        let lock = false;
        const acc_rst_pass_btn = document.getElementById("account-rst-pass--button");
        const acc_rst_email = document.getElementById("account-rst-pass--email");

        var checkAllInputs = function() {
            UIUtils.update_text_field_ui(acc_rst_email, 
                InputValidator.isValidEmail(acc_rst_email.value));
        };
        
        /* ::Add keyboard event listeners to validate text fields:: */
        acc_rst_email.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidEmail(e.target.value));
        });
        /* ::Add keyboard event listeners to validate text fields:: */
        
        document.addEventListener('keyup', e => {
            if (e.keyCode === 13) acc_rst_pass_btn.click();
        });
        
        acc_rst_pass_btn.addEventListener('click', () => {
            if (lock) return; lock = true;
            checkAllInputs();
        
            if (UIUtils.stillAnyInvalid()) return;
        
            firebase.auth().sendPasswordResetEmail(acc_rst_email.value)
            .then(() => {
                UIUtils.showSnackbar('We have sent a link to your email. Please click on the link to reset your password.');
            }).catch(error => {
                if (error.code === 'auth/invalid-email') {
                    UIUtils.showSnackbar('Invalid Credentials. Please try again.');
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
                lock = false;
            });
        });
    }
});