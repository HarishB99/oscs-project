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
        const actionCode = document.querySelector('.id').id;

        let restoredEmail = '';
        firebase.auth().checkActionCode(actionCode)
        .then(info => {
            restoredEmail = info.data.email;

            return firebase.auth().applyActionCode(actionCode);
        }).then(() => user.reload()).then(() => {
            const form_holder_container = document.getElementById('form-holder--container');
            const acc_rst_pass_status = document.getElementById('account-rst-pass--status');
            const buttons_holder = document.getElementById('buttons-holder');
            const firewall_btn = document.getElementById('account-firewall--button');

            acc_rst_pass_status.innerHTML = 'Success!';
            acc_rst_pass_status.parentElement.classList.remove('mdl-color-text--amber');
            if (!acc_rst_pass_status.parentElement.classList.contains('mdl-color-text--green'))
                acc_rst_pass_status.parentElement.classList.add('mdl-color-text--green');
            
            const span = document.createElement('span');
            span.innerHTML = 'Your email has been restored.<br/><br/>It is a good idea to change your password to prevent misuse of your account.';
                document.getElementById('account-rst-pass--button-submit').addEventListener('click', () => {
                    firebase.auth().sendPasswordResetEmail(restoredEmail)
                    .then(() => {
                        UIUtils.showSnackbar('An email has been sent to your email. Please click on the link to reset your password.');
                    }).catch(error => {
                        console.error(`Error while sending password reset email: ${error}`);
                        UIUtils.showSnackbar('An unexpected error occurred. Please try again later.');
                    });
                });
            form_holder_container.appendChild(span);

            // buttons_holder.style.display = 'block';
            buttons_holder.classList.remove('visually-hidden');

            firewall_btn.addEventListener('click', () => {
                if (lock) return; lock = true;
                location.href = '/';
                lock = false
            });
        }).catch(error => {
            console.error(`Error while recovering email: ${error}`);
            UIUtils.showSnackbar('The link has expired. Please try again.');
        });
    } else { UIUtils.logoutUI(); }
});