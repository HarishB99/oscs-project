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
                UIUtils.showSnackbar('We have sent you a link to your email. Please click on the link to reset your password.');
            })
            .catch(error => {
                console.error(`Error while sending password reset email: ${error}`);
                UIUtils.showSnackbar(`An unexpected error occurred. Please try again later.`);
            });
        });
    }
});