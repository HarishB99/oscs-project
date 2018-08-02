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

        firebase.auth().applyActionCode(actionCode)
        .then(() => user.reload()).then(() => {
            const form_holder_container = document.getElementById('form-holder--container');
            const acc_rst_pass_status = document.getElementById('account-rst-pass--status');
            const buttons_holder = document.getElementById('buttons-holder');
            const firewall_btn = document.getElementById('account-firewall--button');

            acc_rst_pass_status.innerHTML = 'Success!';
            acc_rst_pass_status.parentElement.classList.remove('mdl-color-text--amber');
            if (!acc_rst_pass_status.parentElement.classList.contains('mdl-color-text--green'))
                acc_rst_pass_status.parentElement.classList.add('mdl-color-text--green');
            
            const span = document.createElement('span');
            span.innerHTML = 'Your email has been verified.';
            form_holder_container.appendChild(span);

            buttons_holder.style.display = 'block';

            firewall_btn.addEventListener('click', () => {
                if (lock) return; lock = true;
                location.href = '/';
                lock = false
            });
        })
        .catch(error => {
            console.error(`Error while verifying email: ${error}`);
            user.sendEmailVerification()
            .then(() => {
                // Check error code first!!!
                UIUtils.showSnackbar('The link has expired. We have just sent you another link to your email. Please click on it to verify your email.');
            }).catch(err => {
                console.error(`Error while sending verification email: ${err}`);
                UIUtils.showSnackbar('An unexpected error occurred. Please try again later.');
            });
        });
    } else { UIUtils.logoutUI(); }
});