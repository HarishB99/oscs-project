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

const acc_login_btn = document.getElementById("account-login--button");
const acc_login_email = document.getElementById("account-login--email");
const acc_login_pass = document.getElementById("account-login--pass");

function checkAllInputs() {
    UIUtils.update_text_field_ui(acc_login_email, 
        InputValidator.isValidEmail(acc_login_email.value));
    UIUtils.update_text_field_ui(acc_login_pass, 
        InputValidator.isAReasonablyStrongPassword(acc_login_pass.value));
}

checkAllInputs();

/* ::Add keyboard event listeners to validate text fields:: */
acc_login_email.addEventListener('focus', e => {
    UIUtils.update_text_field_ui(e.target, 
        InputValidator.isValidEmail(e.target.value));
}); acc_login_email.addEventListener('keyup', e => {
    UIUtils.update_text_field_ui(e.target, 
        InputValidator.isValidEmail(e.target.value));
});

acc_login_pass.addEventListener('focus', e => {
    UIUtils.update_text_field_ui(acc_login_pass, 
        InputValidator.isAReasonablyStrongPassword(acc_login_pass.value));
}); acc_login_pass.addEventListener('keyup', e => {
    UIUtils.update_text_field_ui(acc_login_pass, 
        InputValidator.isAReasonablyStrongPassword(acc_login_pass.value));
});
/* ::Add keyboard event listeners to validate text fields:: */

document.addEventListener('keyup', e => {
    if (e.keyCode === 13) acc_login_btn.click();
});

acc_login_btn.addEventListener('click', e => {
    checkAllInputs();

    if (UIUtils.stillAnyInvalid()) return;

    firebase.auth().signInWithEmailAndPassword(
        acc_login_email.value, acc_login_pass.value)
    .then(() => {
        location.replace('/');
    }).catch(error => {
        console.error(error);
        if (error.code === 'auth/user-not-found') {
            UIUtils.showSnackbar("Your email does not match our records.", "Create Account", function(e) {
                location.href = '/create_account';
            });
        } else if (error.code === "auth/user-disabled") {
            UIUtils.showSnackbar('Your account has been disabled. Please try again later.');
        } else if (error.code === "auth/wrong-password" || error.code === "auth/invalid-email") {
            UIUtils.showSnackbar("Invalid Credentials. Please try again.");
        } else {
            UIUtils.showSnackbar("An unexpected error occurred. Please try again later.");
        }
    });
});