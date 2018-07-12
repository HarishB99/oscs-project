require('babel-polyfill');
const firebase = require('firebase/app');
require('firebase/auth');
const UIUtils = require('./modules/UIUtils').default;
const InputValidator = require('./modules/InputValidator').default;
const axios = require('axios').default;

const mdlSpinner = document.querySelector('.mdl-spinner').style.display = 'block';
const formHolder = document.getElementById('form-holder').style.display = 'none';

const acc_prof_name = document.getElementById("account-profile--display-name");
const acc_prof_org = document.getElementById("account-profile--display-org");
const acc_prof_email = document.getElementById("account-profile--input-email");
const acc_prof_phone = document.getElementById("account-profile--input-phone");
const acc_prof_btn = document.getElementById("account-update--button");

function checkAllInputs() {
    UIUtils.update_text_field_ui(acc_prof_email, 
        InputValidator.isValidEmail(acc_prof_email.value));
    UIUtils.update_text_field_ui(acc_prof_phone, 
        InputValidator.isValidPhoneNum(acc_prof_phone.value));
}

/* ::Add keyboard event listeners to validate text fields:: */
acc_prof_email.addEventListener('focus', e => {
    UIUtils.update_text_field_ui(e.target, 
        InputValidator.isValidEmail(e.target.value));
}); acc_prof_email.addEventListener('keyup', e => {
    UIUtils.update_text_field_ui(e.target, 
        InputValidator.isValidEmail(e.target.value));
}); acc_prof_email.addEventListener('change', e => {
    UIUtils.update_text_field_ui(e.target, 
        InputValidator.isValidEmail(e.target.value));
});

acc_prof_phone.addEventListener('focus', e => {
    UIUtils.update_text_field_ui(e.target, 
        InputValidator.isValidPhoneNum(e.target.value));
}); acc_prof_phone.addEventListener('keyup', e => {
    UIUtils.update_text_field_ui(e.target, 
        InputValidator.isValidPhoneNum(e.target.value));
}); acc_prof_phone.addEventListener('change', e => {
    UIUtils.update_text_field_ui(e.target, 
        InputValidator.isValidPhoneNum(e.target.value));
});
/* ::Add keyboard event listeners to validate text fields:: */

document.addEventListener('keyup', e => {
    if (e.keyCode === 13) acc_prof_btn.click();
});

acc_prof_btn.addEventListener('click', e => {
    checkAllInputs();
    
    if (UIUtils.stillAnyInvalid()) return;

    firebase.auth().currentUser
    .getIdToken(true).then(token => {
        return axios({
            url: '/account-update',
            method: 'POST',
            headers: {
                'Authorisation': 'Bearer ' + token
            },
            data: {
                email: acc_prof_email.value,
                contact: acc_prof_phone.value
            }
        });
    }).then(response => {
        const payload = response.data;
        if (payload.code === 'account/update-success') {
            // TODO: Update successful
            location.reload();
        } else {
            UIUtils.showSnackbar(payload.message);
        }
    }).catch(error => {
        console.error('Error while sending account update request to server: ', error);
        UIUtils.showSnackbar('An unexpected error occurred. Please try again.');
    });
})

function displayProfile(user, tokenResult) {
    acc_prof_name.innerHTML = user.displayName;
    acc_prof_org.innerHTML = tokenResult.claims.organisation;
    acc_prof_email.value = user.email;
    acc_prof_phone.value = user.phoneNumber.split("+65")[1];
    checkAllInputs();
    document.querySelector(".mdl-spinner").style.display = "none";
    document.getElementById("form-holder").style.display = "block";
}

firebase.auth().onAuthStateChanged(user => {
    if (!InputValidator.isEmpty(user)) {
        user.getIdTokenResult(true)
        .then(tokenResult => {
            displayProfile(user, tokenResult);
        }).catch(error => {
            console.error('Error while retrieving profile data: ', error);
            UIUtils.showSnackbar('An unexpected error occurred. Please try again later.');
        });
    } else {
        UIUtils.logoutUI();
    }
});