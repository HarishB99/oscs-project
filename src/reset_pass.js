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
        
        const acc_rst_pass_pass = document.getElementById('account-rst-pass--password');
        const acc_rst_pass_new_pass = document.getElementById('account-rst-pass--new-password');
        const acc_rst_pass_new_pass2 = document.getElementById('account-rst-pass--new-password2');
        const acc_rst_pass_btn = document.getElementById('account-rst-pass--button-submit');

        var checkAllInputs = function() {
            UIUtils.update_text_field_ui(acc_rst_pass_pass, 
                InputValidator.isAReasonablyStrongPassword(acc_rst_pass_pass.value));
            UIUtils.update_text_field_ui(acc_rst_pass_new_pass, 
                InputValidator.isAReasonablyStrongPassword(acc_rst_pass_new_pass.value));
            UIUtils.update_text_field_ui(acc_rst_pass_new_pass2, 
                (acc_rst_pass_new_pass.value === acc_rst_pass_new_pass2.value && acc_rst_pass_new_pass2.value !== ''));
        };

        acc_rst_pass_pass.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isAReasonablyStrongPassword(e.target.value));
        });

        acc_rst_pass_new_pass.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isAReasonablyStrongPassword(e.target.value));
        });

        acc_rst_pass_new_pass2.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                (acc_rst_pass_new_pass.value === e.target.value && e.target.value !== ''));
        });

        document.addEventListener('keyup', e => {
            if (e.keyCode === 13) acc_rst_pass_btn.click();
        });

        acc_rst_pass_btn.addEventListener('click', () => {
            if (lock) return; lock = true;
            checkAllInputs();

            if (UIUtils.stillAnyInvalid()) return;

            unsubscribe();

            user.reauthenticateAndRetrieveDataWithCredential(
                firebase.auth.EmailAuthProvider.credential(user.email, acc_rst_pass_pass.value)
            ).then(credential => {
                return credential.user.updatePassword(acc_rst_pass_new_pass.value);
            }).then(() => {
                location.replace('/');
            }).catch(error => {
                console.log(`Error while updating password: ${error}`);
                UIUtils.showSnackbar('An unexpected error occurred. Please try again later.');
                lock = false;
            });
        });
    } else { UIUtils.logoutUI(); }
});