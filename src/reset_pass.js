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

        const actionCode = document.querySelector('.id').id;

        firebase.auth().verifyPasswordResetCode(actionCode).then(() => {
            const form_holder_container = document.getElementById('form-holder--container');
            const acc_rst_pass_status = document.getElementById('account-rst-pass--status');
            const acc_rst_pass_pass = document.getElementById('account-rst-pass--password');
            const acc_rst_pass_new_pass = document.getElementById('account-rst-pass--new-password');
            const acc_rst_pass_new_pass2 = document.getElementById('account-rst-pass--new-password2');
            const acc_rst_pass_btn = document.getElementById('account-rst-pass--button-submit');
            const acc_login_btn = document.getElementById('account-login--button');

            if (!user.emailVerified) {
                acc_rst_pass_pass.disabled = true;
                acc_rst_pass_new_pass.disabled = true;
                acc_rst_pass_new_pass2.disabled = true;
                acc_rst_pass_btn.disabled = true;
                acc_login_btn.disabled = true;
                UIUtils.showSnackbar('Please verify your email before you proceed.');
            }

            var checkAllInputs = function() {
                UIUtils.update_text_field_ui(acc_rst_pass_pass, 
                    InputValidator.isAReasonablyStrongPassword(acc_rst_pass_pass.value));
                UIUtils.update_text_field_ui(acc_rst_pass_new_pass, 
                    InputValidator.isAReasonablyStrongPassword(acc_rst_pass_new_pass.value));
                UIUtils.update_text_field_ui(acc_rst_pass_new_pass2, 
                    (acc_rst_pass_new_pass.value === acc_rst_pass_new_pass2.value && acc_rst_pass_new_pass2.value !== ''));
            };

            /* ::Add keyboard event listeners to validate text fields:: */
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
            /* ::Add keyboard event listeners to validate text fields:: */

            document.addEventListener('keyup', e => {
                if (e.keyCode === 13 && !InputValidator.isEmpty(acc_rst_pass_btn)) acc_rst_pass_btn.click();
            });

            acc_login_btn.addEventListener('click', () => {
                if (lock) return; lock = true;
                location.replace('/login');
                lock = false
            });

            acc_rst_pass_btn.addEventListener('click', () => {
                if (lock || !(user.emailVerified)) return; lock = true;
                checkAllInputs();

                if (UIUtils.stillAnyInvalid()) return;

                unsubscribe();

                user.reauthenticateAndRetrieveDataWithCredential(
                    firebase.auth.EmailAuthProvider.credential(user.email, acc_rst_pass_pass.value)
                ).then(() => {
                    return firebase.auth().confirmPasswordReset(actionCode, acc_rst_pass_new_pass.value);
                }).then(() => {
                    acc_rst_pass_status.innerHTML = 'Success!';
                    acc_rst_pass_status.parentElement.classList.remove('mdl-color-text--amber');
                    if (!acc_rst_pass_status.parentElement.classList.contains('mdl-color-text--green'))
                        acc_rst_pass_status.parentElement.classList.add('mdl-color-text--green');
                    // Reset form_holder_container
                    form_holder_container.innerHTML = '';
                    const span = document.createElement('span');
                        span.innerHTML = 'Your password has been reset.';
                    form_holder_container.appendChild(span);

                    if (!acc_rst_pass_btn.classList.contains('visually-hidden'))
                        acc_rst_pass_btn.classList.add('visually-hidden');
                    acc_login_btn.classList.remove('visually-hidden');
                    lock = false;
                }).catch(error => {
                    if (error.code === 'auth/wrong-password') {
                        acc_rst_pass_pass.value = '';
                        if (acc_rst_pass_pass.parentElement.classList.contains('is-dirty') || acc_rst_pass_pass.parentElement.classList.contains('is-focused')) {
                            acc_rst_pass_pass.parentElement.classList.remove('is-dirty');
                            acc_rst_pass_pass.parentElement.classList.remove('is-focused');
                        }
                        if (!acc_rst_pass_pass.parentElement.classList.contains('is-invalid'))
                            acc_rst_pass_pass.parentElement.classList.add('is-invalid');
                        acc_rst_pass_new_pass.value = '';
                        acc_rst_pass_new_pass.parentElement.classList.remove('is-dirty');
                        acc_rst_pass_new_pass2.value = '';
                        acc_rst_pass_new_pass2.parentElement.classList.remove('is-dirty');
                        UIUtils.showSnackbar('Invalid Credentials. Please try again.');
                    } else if (error.code === 'auth/user-mismatch' || error.code === "auth/invalid-email" || error.code === 'auth/invalid-user-token' || error.code === 'auth/user-token-expired' || error.code === 'auth/user-disabled' || error.code === 'auth/user-not-found') {
                        firebase.auth().signOut()
                        .catch(() => {
                            UIUtils.showSnackbar('Your have to logout and login again to perform this action.');
                            lock = false;
                        });
                    } else if (error.code === 'auth/network-request-failed' || error.message === 'Network Error') {
                        UIUtils.showSnackbar('Please check your network connection and try again.');
                    } else if (error.code === 'auth/weak-password') {
                        UIUtils.showSnackbar('Please check your input and try again.');
                    } else if (error.code === 'auth/expired-action-code' || error.code === 'auth/invalid-action-code') {
                        firebase.auth().sendPasswordResetEmail(user.email)
                        .then(() => {
                            UIUtils.showSnackbar('The link has expired. We have just sent you another link to your email. Please click on it to reset your password.');
                        }).catch(err => {
                            if (err.code === 'auth/invalid-email' || err.code === 'auth/invalid-user-token' || err.code === 'auth/user-token-expired' || err.code === 'auth/user-disabled' || err.code === 'auth/user-not-found') {
                                firebase.auth().signOut()
                                .catch(() => {
                                    UIUtils.showSnackbar('Your have to logout and login again to perform this action.');
                                    lock = false;
                                });
                            } else if (err.code === 'auth/network-request-failed' || err.message === 'Network Error') {
                                UIUtils.showSnackbar('Please check your network connection and try again.');
                            } else {
                                console.log(error);
                                UIUtils.showSnackbar('An unexpected error occurred. Please try again later.');
                            }
                            lock = false;
                        });
                    } else {
                        UIUtils.showSnackbar('An unexpected error occurred. Please try again later.');
                    }
                    lock = false;
                });
            });
        }).catch(error => {
            if (error.code === 'auth/expired-action-code' || error.code === 'auth/invalid-action-code') {
                firebase.auth().sendPasswordResetEmail(user.email)
                .then(() => {
                    UIUtils.showSnackbar('The link has expired. We have just sent you another link to your email. Please click on it to reset your password.');
                }).catch(err => {
                    if (err.code === 'auth/invalid-email' || err.code === 'auth/invalid-user-token' || err.code === 'auth/user-token-expired' || err.code === 'auth/user-disabled' || err.code === 'auth/user-not-found') {
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
                    lock = false;
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
            lock = false;
        });
    } else { UIUtils.logoutUI(); }
});