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
        let lock = false;
        
        const acc_rst_email_pass = document.getElementById('account-rst-email--password');
        const acc_rst_email_new_email = document.getElementById('account-rst-email--new-email');
        const acc_rst_email_new_email2 = document.getElementById('account-rst-email--new-email2');
        const acc_rst_email_btn = document.getElementById('account-rst-email--button-submit');

        const acc_rst_inputs_holder = document.getElementById('account-rst-email--inputs-holder');
        const acc_rst_buttons_holder = document.getElementById('account-rst-email--buttons-holder');
        const form_holder = document.getElementById('form-holder');

        if (!user.emailVerified) {
            acc_rst_email_pass.disabled = true;
            acc_rst_email_new_email.disabled = true;
            acc_rst_email_new_email2.disabled = true;
            acc_rst_email_btn.disabled = true;
            UIUtils.showSnackbar('Please verify your email before you proceed.');
        }

        var checkAllInputs = function() {
            UIUtils.update_text_field_ui(acc_rst_email_pass, 
                InputValidator.isAReasonablyStrongPassword(acc_rst_email_pass.value));
            UIUtils.update_text_field_ui(acc_rst_email_new_email, 
                InputValidator.isValidEmail(acc_rst_email_new_email.value));
            UIUtils.update_text_field_ui(acc_rst_email_new_email2, 
                (acc_rst_email_new_email.value === acc_rst_email_new_email2.value && acc_rst_email_new_email2.value !== ''));
        };

        /* ::Add keyboard event listeners to validate text fields:: */
        acc_rst_email_pass.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isAReasonablyStrongPassword(e.target.value));
        });

        acc_rst_email_new_email.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidEmail(e.target.value));
        });

        acc_rst_email_new_email2.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                (acc_rst_email_new_email.value === e.target.value && e.target.value !== ''));
        });
        /* ::Add keyboard event listeners to validate text fields:: */

        document.addEventListener('keyup', e => {
            if (e.keyCode === 13) acc_rst_email_btn.click();
        });

        acc_rst_email_btn.addEventListener('click', () => {
            if (lock) return; lock = true;
            checkAllInputs()

            if (UIUtils.stillAnyInvalid()) return;

            unsubscribe();

            user.reauthenticateAndRetrieveDataWithCredential(
                firebase.auth.EmailAuthProvider.credential(user.email, acc_rst_email_pass.value)
            ).then(credential => {
                return credential.user.updateEmail(acc_rst_email_new_email.value);
            }).then(() => {
                return user.sendEmailVerification();
            }).then(() => {
                form_holder.removeChild(acc_rst_buttons_holder);
                acc_rst_inputs_holder.innerHTML = '';
                const span = document.createElement('span');
                    span.innerHTML = 'We have sent a link to your email. Please click on the link to verify your email.';
                acc_rst_inputs_holder.appendChild(span);
                UIUtils.showSnackbar('We have sent a link to your email. Please click on the link to verify your email.');
                lock = false;
            }).catch(error => {
                if (error.code === 'auth/wrong-password') {
                    UIUtils.showSnackbar('Invalid Credentials. Please try again.');
                } else if (error.code === 'auth/user-mismatch' || error.code === "auth/invalid-email" || error.code === 'auth/invalid-user-token' || error.code === 'auth/user-token-expired' || error.code === 'auth/user-disabled' || error.code === 'auth/user-not-found') {
                    firebase.auth().signOut()
                    .catch(() => {
                        UIUtils.showSnackbar('Your have to logout and login again to perform this action.');
                        lock = false;
                    });
                } else if (error.code === 'auth/network-request-failed' || error.message === 'Network Error') {
                    UIUtils.showSnackbar('Please check your network connection and try again.');
                } else if (error.code === 'auth/email-already-in-use') {
                    UIUtils.showSnackbar('That email is already in use.');
                } else {
                    UIUtils.showSnackbar('An unexpected error occurred. Please try again later.');
                }
                lock = false;
            });
        });
    } else { UIUtils.logoutUI(); }
});