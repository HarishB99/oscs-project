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
        let lock = false;
        const email_display = document.getElementById('mdl-drawer--email');
        const profile_btn = document.getElementById('mdl-menu__item--profile');
        const signout_btn = document.getElementById('mdl-menu__item--signout');
        const firewall_policies_btn = document.getElementById('mdl-navigation__link--rules');
        
        email_display.innerHTML = user.displayName;

        profile_btn.addEventListener('click', () => {
            if (lock) return; lock = true;
            location.href = '/profile';
            lock = false;
        });
        
        signout_btn.addEventListener('click', () => {
            if (lock) return; lock = true;
            firebase.auth().signOut()
            .catch(error => {
                if (error.code === 'auth/network-request-failed') {
                    UIUtils.showSnackbar('Please check your network connection and try again.');
                } else {
                    UIUtils.showSnackbar('Please clear your browser cache or restart your browser, and try again.');
                }
                lock = false;
            });
        });

        firewall_policies_btn.addEventListener('click', () => {
            if (lock) return; lock = true;
            location.href = '/';
            lock = false
        });
        
        const mdlSpinner = document.querySelector('.mdl-spinner');
        const formHolder = document.getElementById('form-holder');
        
        mdlSpinner.style.display = 'block';
        formHolder.style.display = 'none';
        
        const acc_prof_name = document.getElementById("account-profile--display-name");
        const acc_prof_email = document.getElementById("account-profile--display-email");
        const acc_prof_email_btn = document.getElementById("account-profile--btn-email");
        const acc_prof_rst_pass_btn = document.getElementById('account-profile--btn-rst-pass');
        const acc_prof_verify_email_btn = document.getElementById('account-profile--btn-verify-email');

        if (!user.emailVerified) {
            acc_prof_email_btn.disabled = true;
            acc_prof_rst_pass_btn.disabled = true;
            UIUtils.showSnackbar('Please verify your email before you proceed to manage your profile.');
        } else {
            acc_prof_verify_email_btn.disabled = true;
            acc_prof_verify_email_btn.style.display = 'none';
        }
        
        acc_prof_email_btn.addEventListener('click', () => {
            if (lock) return; lock = true;
            location.href = '/reset_email';
            lock = false;
        });

        acc_prof_rst_pass_btn.addEventListener('click', () => {
            if (lock) return; lock = true;

            firebase.auth().sendPasswordResetEmail(user.email)
            .then(() => {
                UIUtils.showSnackbar('We have sent a link to your email. Please click on the link to reset your password.');
            }).catch(error => {
                if (error.code === 'auth/invalid-email' || error.code === 'auth/invalid-user-token' || error.code === 'auth/user-token-expired' || error.code === 'auth/user-disabled' || error.code === 'auth/user-not-found') {
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

        acc_prof_verify_email_btn.addEventListener('click', () => {
            if (lock) return; lock = true;
            user.sendEmailVerification()
            .then(() => {
                UIUtils.showSnackbar('We have sent a link to your email. Please click on the link to verify your email.');
                lock = false;
            }).catch(error => {
                if (error.code === 'auth/user-mismatch' || error.code === "auth/invalid-email" || error.code === 'auth/invalid-user-token' || error.code === 'auth/user-token-expired' || error.code === 'auth/user-disabled' || error.code === 'auth/user-not-found') {
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
            lock = false;
        });
        
        var displayProfile = function(user) {
            acc_prof_name.innerHTML = user.displayName;
            acc_prof_email.innerHTML = user.email;
            mdlSpinner.style.display = "none";
            formHolder.style.display = "block";
        };

        displayProfile(user);
    } else { UIUtils.logoutUI(); }
});