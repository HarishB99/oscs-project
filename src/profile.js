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
                console.error('Error while signing out user: ', error);
                UIUtils.showSnackbar('Please clear your browser cache or restart your browser, and try again.');
                lock = false;
            });
        });
        
        const mdlSpinner = document.querySelector('.mdl-spinner');
        const formHolder = document.getElementById('form-holder');
        
        mdlSpinner.style.display = 'block';
        formHolder.style.display = 'none';
        
        const acc_prof_name = document.getElementById("account-profile--display-name");
        const acc_prof_email = document.getElementById("account-profile--display-email");
        const acc_prof_email_btn = document.getElementById("account-profile--btn-email");
        const acc_prof_rst_pass_btn = document.getElementById('account-profile--btn-rst-pass');
        
        acc_prof_email_btn.addEventListener('click', () => {
            if (lock) return; lock = true;
            // checkAllInputs();
            
            // if (UIUtils.stillAnyInvalid()) return;

            // user.updateEmail(acc_prof_email.value)
            // .then(() => { lock = false; })
            // .catch(error => {
            //     console.error(`Error while updating user's email: ${error}`);
            //     UIUtils.showSnackbar('An unexpected error occurred. Please try again later.');
            //     lock = false;
            // });
            lock = false;
        })

        acc_prof_rst_pass_btn.addEventListener('click', () => {
            if (lock) return; lock = true;
            // firebase.auth().sendPasswordResetEmail(user.email);
            
            // user.updatePassword();
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