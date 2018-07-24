require('babel-polyfill');

// Firebase libraries
const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/firestore');

// Initialise firebase
const config = require('./modules/config').config;
firebase.initializeApp(config);

// Import other custom libraries
const axios = require('axios').default;
const InputValidator = require('./modules/InputValidator').default;
const UIUtils = require('./modules/UIUtils').default;

firebase.auth().onAuthStateChanged(user => {
    if (!InputValidator.isEmpty(user)) {
        const email_display = document.getElementById('mdl-drawer--email');
        const profile_btn = document.getElementById('mdl-menu__item--profile');
        const signout_btn = document.getElementById('mdl-menu__item--signout');
        
        email_display.innerHTML = user.email;

        profile_btn.addEventListener('click', () => {
            location.href = '/profile';
        });
        
        signout_btn.addEventListener('click', () => {
            firebase.auth().signOut()
            .then(() => {
                location.replace('/login');
            })
            .catch(error => {
                console.error('Error while signing out user: ', error);
                UIUtils.showSnackbar('An unexpected error occurred. Please clear your browser cache, restart your browser and try again.');
            });
        });

        // #firewall-rule__table
        const mdl_spinner_holder = document.getElementById('mdl-spinner--holder');
        const ruleRowsName = 'rules';
        
        document.getElementById('firewall-rule__button--add')
        .addEventListener('click', () => {
            location.href = '/create_rule';
        });
    
        const db = firebase.firestore();
        db.settings({
            timestampsInSnapshots: true
        });
        // #web-filter

        // #global
        const block_ads = document.getElementById('web-filter__block-ads');
        const block_malicious = document.getElementById('web-filter__block-malicious');
        const dpi = document.getElementById('firewall-rule__dpi');
        const vs = document.getElementById('firewall-rule__vs');
        const global_submit_btn = document.getElementById('global--btn-submit');

        global_submit_btn.addEventListener('click', () => {
            user.getIdToken(true)
            .then(token => {
                return axios({
                    url: '/global-update',
                    method: 'POST',
                    headers: {
                        'Authorisation': 'Bearer ' + token
                    },
                    data: {
                        dpi: dpi.parentElement.classList.contains('is-checked').toString(),
                        virusScan: vs.parentElement.classList.contains('is-checked').toString(),
                        blockAds: block_ads.parentElement.classList.contains('is-checked').toString(),
                        blockMalicious: block_malicious.parentElement.classList.contains('is-checked').toString()
                    }
                })
            }).then(response => {
                const payload = response.data;
                UIUtils.showSnackbar(payload.message);
            }).catch(error => {
                console.error('Error while sending options update request to server: ', error);
                UIUtils.showSnackbar('An unexpected error occurred. Please try again.');
            });
        });      

        db.doc(`/users/${user.uid}/options/global`)
        .onSnapshot(options => {
            const opts = options.data();
            UIUtils.toggleSwitch(opts.dpi, dpi);
            UIUtils.toggleSwitch(opts.virusScan, vs);
            UIUtils.toggleSwitch(opts.blockAds, block_ads);
            UIUtils.toggleSwitch(opts.blockMalicious, block_malicious);
        });

        db.collection('users').doc(user.uid)
        .collection('rules').onSnapshot(rules => {
            UIUtils.toggleLoader(true, mdl_spinner_holder);
            const tbody = document.getElementById('firewall-rule__table--list');

            UIUtils.clearTable(tbody, ruleRowsName);

            if (rules.empty) {
                UIUtils.toggleLoader(false, mdl_spinner_holder);
                const tr = document.createElement('tr');
                tr.className = ruleRowsName;
                    const noRules = document.createElement('td');
                        noRules.className = "mdl-data-table__cell--non-numeric rule";
                        noRules.colSpan = 9;
                        noRules.innerHTML = "You have not configured any rules.";
                    tr.appendChild(noRules);
                tbody.appendChild(tr);
            } else {
                UIUtils.toggleLoader(false, mdl_spinner_holder);
                // Rules is not empty
                rules.forEach(rule => {
                    const params = rule.data();
                    const {
                        access,
                        name, 
                        priority, 
                        sourceip, 
                        sourceport, 
                        destip, 
                        destport, 
                        protocol, 
                        direction
                    } = params;

                    const allow = access ? "Allow" : "Deny";
                    const trafficflow = direction ? "Incoming" : "Outgoing";

                    const tr = document.createElement('tr');
                    tr.className = ruleRowsName;
                        const ruleName = document.createElement("td");
                            ruleName.className = "rule";
                            ruleName.innerHTML = name;
                        const allowed = document.createElement("td");
                            allowed.className = "access";
                            allowed.innerHTML = allow;
                        const prior = document.createElement("td");
                            prior.className = "mdl-data-table__cell--non-numeric priority";
                            prior.innerHTML = priority;
                        const sip = document.createElement("td");
                            sip.className = "saddr";
                            sip.innerHTML = sourceip;
                        const sport = document.createElement("td");
                            sport.className = "sport";
                            sport.innerHTML = sourceport;
                        const dip = document.createElement("td");
                            dip.className = "daddr";
                            dip.innerHTML = destip;
                        const dport = document.createElement("td");
                            dport.className = "dport";
                            dport.innerHTML = destport;
                        const proto = document.createElement("td");
                            proto.className = "protocol";
                            proto.innerHTML = protocol;
                        const incoming = document.createElement("td");
                            incoming.className = "direction";
                            incoming.innerHTML = trafficflow;
                        const buttonsHolder = document.createElement("td");
                            const editBtn = document.createElement("button");
                            editBtn.className = "firewall-rule__button--edit mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect";
                            editBtn.innerHTML = "<i class=\"material-icons\">edit</i> Edit";
                            editBtn.style.width = "100%";
                            editBtn.addEventListener('click', () => {
                                user.getIdToken(true)
                                .then(token => location.href = `/edit_rule/${token}`)
                                .catch(error => {
                                    console.error(`Error while sending request to edit rule: ${error}`);
                                });
                                
                            });
                            buttonsHolder.appendChild(editBtn);
                                // Insert line breaks
                                buttonsHolder.appendChild(
                                    document.createElement('br'));
                                buttonsHolder.appendChild(
                                    document.createElement('br'));
                            const deleteBtn = document.createElement('button');
                            deleteBtn.className = "firewall-rule__button--delete mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect";
                            deleteBtn.innerHTML = "<i class=\"material-icons\">delete</i> Delete";
                            deleteBtn.style.width = "100%";
                            buttonsHolder.appendChild(deleteBtn);
                        tr.appendChild(prior);
                        tr.appendChild(ruleName);
                        tr.appendChild(allowed);
                        tr.appendChild(sip);
                        tr.appendChild(sport);
                        tr.appendChild(dip);
                        tr.appendChild(dport);
                        tr.appendChild(proto);
                        tr.appendChild(incoming);
                        tr.appendChild(buttonsHolder);
                    tbody.appendChild(tr);
                });
            }
            const options = {
                valueNames: ['priority', 'rule', 'access', 
                'saddr','sport', 'daddr', 'dport', 'protocol', 'direction']
            };
            const ruleList = new List('firewall-rule__table', options);
            $(function() {
                $($('th.sort')[0]).trigger('click', function() {
                    console.log('clicked');
                });

                $('input.search').on('keyup', function(e) {
                    if (e.keyCode === 27) {
                        $(e.currentTarget).val('');
                        ruleList.search('');
                    } else {
                        ruleList.search($(this).val());
                    }
                });
            });
        }, error => {
            console.log('Error while retrieving data from server: ', error);
            UIUtils.showSnackbar('An unexpected error occurred. Please try again later.');
        });
    } else { UIUtils.logoutUI(); }
});