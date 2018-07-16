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

// const resendInterval = window.setInterval(() => {
//     const resendBtnHolder = document.getElementById('account-login--otp-link--holder');
//     if (resendBtnHolder.style.display === 'none') {
//         resendBtnHolder.style.display === 'block';
//     }
// }, 30000);

// const verificationIds = [];

firebase.auth().onAuthStateChanged(user => {
    if (!InputValidator.isEmpty(user)) {
        const acc_login_otp_form = document.getElementById('account-login--otp-form');
        const acc_login_otp = document.getElementById("account-login--otp");
        const acc_login_otp_btn = document.getElementById("account-login--otp-button");
        // const acc_login_resend_btn = document.getElementById("account-login--otp-link--resend");

        // acc_login_otp_form.style.display = "none";

        UIUtils.update_text_field_ui(acc_login_otp, 
            InputValidator.isValidOTP(acc_login_otp.value));
        
        acc_login_otp.addEventListener('focus', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidOTP(e.target.value));
        }); acc_login_otp.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidOTP(e.target.value));
        });

        const recaptchaVerifier 
            = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
                'size': 'invisible'
            });

        let result = '';

        user.reauthenticateWithPhoneNumber(user.phoneNumber, recaptchaVerifier)
        .then(confirmationResult => {
            // results.push(confirmationResult.verificationId);
            result = confirmationResult;
        });
        
        // window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
        // recaptchaVerifier.render()
        // .then(function(widgetId) {
        //     window.recaptchaWidgetId =widgetId;
        // });

        document.addEventListener('keyup', e => {
            if (e.keyCode === 13) acc_login_otp_btn.click();
        });
        
        acc_login_otp_btn.addEventListener('click', e => {
            UIUtils.update_text_field_ui(acc_login_otp, 
                InputValidator.isValidOTP(acc_login_otp.value));
            
            if (UIUtils.stillAnyInvalid()) return;

            result.confirm(acc_login_otp.value)
            .then(() => {
                // TODO: Success
                location.replace('/');
            })
            .catch(error => {
                console.error('Error during otp login: ', error);
                if (error.code === 'auth/invalid-verification-code') {
                    UIUtils.showSnackbar('The OTP code is invalid. Try again.');
                    recaptchaVerifier.render().then(widgetId => {
                        grecaptcha.reset(widgetId);
                    });
                }
            });
        });

        // acc_login_resend_btn.addEventListener('click', e => {
        //     document.getElementById('account-login--otp-link--holder')
        //     .style.display = 'none';

        //     window.clearInterval(resendInterval);
        //     resendInterval = window.setInterval(() => {
        //         const resendBtnHolder = document.getElementById('account-login--otp-link--holder');
        //         if (resendBtnHolder.style.display === 'none') {
        //             resendBtnHolder.style.display === 'block';
        //         }
        //     }, 30000);
            
        //     user.linkWithPhoneNumber(user.phoneNumber, recaptchaVerifier)
        //     .then(confirmationResult => {
        //         results.push(confirmationResult.verificationId);
        //     });
        // });
    } else { UIUtils.logoutUI(); }
});