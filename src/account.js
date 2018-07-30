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
        location.replace('/');
    } else {
        let lock = false;
        const acc_req_email = document.getElementById("account-create--input-email");
        const acc_req_org = document.getElementById("account-create--input-org");
        const acc_req_phone = document.getElementById("account-create--input-phone");
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
            UIUtils.update_text_field_ui(acc_req_org, 
                InputValidator.isValidOrgName(acc_req_org.value));
            UIUtils.update_text_field_ui(acc_req_phone, 
                InputValidator.isValidPhoneNum(acc_req_phone.value));
            UIUtils.update_text_field_ui(acc_req_pass, 
                InputValidator.isAReasonablyStrongPassword(acc_req_pass.value));
            UIUtils.update_text_field_ui(pass2, 
                (acc_req_pass.value === pass2.value && pass2.value !== ''));
        };

        // checkAllInputs();

        /* ::Add keyboard event listeners to validate text fields:: */
        // acc_req_email.addEventListener('focus', e => {
        //     UIUtils.update_text_field_ui(e.target, 
        //         InputValidator.isValidEmail(e.target.value));
        // }); 
        acc_req_email.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidEmail(e.target.value));
        });

        acc_req_org.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidOrgName(e.target.value));
        });

        acc_req_phone.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidPhoneNum(e.target.value));
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
            
            axios.post("/account-create", {
                email: acc_req_email.value,
                org: acc_req_org.value,
                contact: acc_req_phone.value,
                pass: acc_req_pass.value
            }).then(response => {
                if (response.data.code === 'account/creation-success') {
                    location.replace('/login');
                } else {
                    UIUtils.showSnackbar(response.data.message);
                    lock = false;
                }
            }).catch(error => {
                console.error("Error while performing account creation request: ", error);
                if (error.message === "Network Error") {
                    UIUtils.showSnackbar("Please check your network connection and try again.");
                } else if (error.message.indexOf('404') >= 0) {
                    UIUtils.showSnackbar("Sorry. The functionality has not been enabled.");
                } else {
                    UIUtils.showSnackbar("An unexpected error occurred. Please try again later.");
                }
                lock = false;
            });
        });
    }
});