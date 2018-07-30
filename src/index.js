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

        // #firewall-rule__table
        const mdl_spinner_holder = document.getElementById('mdl-spinner--holder');
        const ruleRowsName = 'rules';

        document.getElementById('firewall-rule__button--add').addEventListener('click', () => {
            if (lock) return; lock = true;
            location.href = '/create_rule';
            lock = false;
        });

        const db = firebase.firestore();
        db.settings({timestampsInSnapshots: true});

        db.collection(`/users/${user.uid}/rules`).onSnapshot(rules => {
            UIUtils.toggleLoader(true, mdl_spinner_holder);
            const tbody = document.getElementById('firewall-rule__table--list');
            
            UIUtils.clearTable(tbody, ruleRowsName);

            if (rules.empty) {
                UIUtils.toggleLoader(false, mdl_spinner_holder);
                const tr = document.createElement('tr');
                tr.className = ruleRowsName;
                    const noRules = document.createElement('td');
                        noRules.className = "mdl-data-table__cell--non-numeric rule";
                        noRules.colSpan = 10;
                        noRules.innerHTML = "You have not configured any rules. Start creating one by clicking on the \'+ Add\' button above.";
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
                                if (lock) return; lock = true;
                                user.getIdToken(true)
                                .then(token => location.href = `/edit_rule/${token}?rule=${rule.id}`)
                                .catch(error => {
                                    // TODO: Handle retrieving token errors
                                    console.error(`Error while retrieving token: ${error}`);
                                    lock = false;
                                });
                            });
                            buttonsHolder.appendChild(editBtn);
                                // Insert line breaks
                                buttonsHolder.appendChild(document.createElement('br'));
                                buttonsHolder.appendChild(document.createElement('br'));
                            const deleteBtn = document.createElement('button');
                            deleteBtn.className = "firewall-rule__button--delete mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect";
                            deleteBtn.innerHTML = "<i class=\"material-icons\">delete</i> Delete";
                            deleteBtn.style.width = "100%";
                            deleteBtn.addEventListener('click', () => {
                                if (lock) return; lock = true;
                                user.getIdToken(true)
                                .then(token => location.href = `/delete_rule/${token}?rule=${rule.id}`)
                                .catch(error => {
                                    // TODO: Handle retrieving token errorsy
                                    console.error(`Error while retrieving token: ${error}`);
                                    lock = false;
                                });
                            });
                            buttonsHolder.appendChild(deleteBtn);
                        tr.append(prior, ruleName, allowed, sip, sport, 
                                    dip, dport, proto, incoming, buttonsHolder)
                    tbody.append(tr);
                });
            }
            const options = {
                valueNames: ['priority', 'rule', 'access', 'saddr','sport', 
                'daddr', 'dport', 'protocol', 'direction']};
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
            UIUtils.showSnackbar('We are unable to retrieve your firewall rules. Please try again later.');
        });

        // #web-filter
        let filters = '';
        const web_filter_list = document.getElementById('web-filter__table--list');
        const web_filter_domain = document.getElementById('web-filter__domain');
        const web_filter_btn_add = document.getElementById('web-filter__btn-add');
        const web_filter_mode_label = document.querySelector('label[for=\'web-filter__mode\']');
        const web_filter_mode = document.getElementById('web-filter__mode');
        const web_filter_btn_publish = document.getElementById('web-filter__btn-submit');
        const web_filter_btn_cancel = document.getElementById('web-filter__btn-cancel');

        const checkAllInputs = function() {
            UIUtils.update_text_field_ui(web_filter_domain, 
                InputValidator.isValidUrl(web_filter_domain.value));
        };

        const allDomainsAreValid = function(domains) {
            for (let i = 0; i < domains.length; i++) {
                let filter = domains[i].innerHTML;
                filter = filter.trim();
                if (!InputValidator.isValidUrl(filter)) {
                    return false;
                }
            }
            return true;
        };

        const resetFiltersList = function () {
            UIUtils.toggleSwitch(filters.mode, web_filter_mode);

            // Reset web_filter_list
            web_filter_list.innerHTML = '';

            filters.domains.forEach(domain => {
                const tr = document.createElement('tr');
                    const domain_holder = document.createElement('td');
                        domain_holder.className = 'domain mdl-data-table__cell--non-numeric';
                        domain_holder.innerHTML = domain;
                    tr.appendChild(domain_holder);
                    const filter_del_btn_holder = document.createElement('td');
                        const filter_del_btn = document.createElement('button');
                            filter_del_btn.className = 'mdl-button mdl-js-button mdl-button--icon';
                            filter_del_btn.innerHTML = '<i class=\"material-icons\">cancel</i>';
                            filter_del_btn.addEventListener('click', () => {
                                if (lock) return; lock = true;
                                web_filter_list.removeChild(tr)
                                lock = false
                            });
                        filter_del_btn_holder.appendChild(filter_del_btn);
                    tr.appendChild(filter_del_btn_holder)
                web_filter_list.appendChild(tr);
            });
        }

        web_filter_domain.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidUrl(e.target.value));
        });

        web_filter_btn_add.addEventListener('click', () => {
            if (lock) return; lock = true;
            checkAllInputs();
        
            if (UIUtils.stillAnyInvalid()) return;

            const tr = document.createElement('tr');
                const domain = document.createElement('td');
                    // domain.id = 'domain';
                    domain.className = 'domain mdl-data-table__cell--non-numeric';
                    domain.innerHTML = web_filter_domain.value;
                tr.appendChild(domain);
                const filter_del_btn_holder = document.createElement('td');
                    const filter_del_btn = document.createElement('button');
                        filter_del_btn.className = 'mdl-button mdl-js-button mdl-button--icon';
                        filter_del_btn.innerHTML = '<i class=\"material-icons\">cancel</i>';
                        filter_del_btn.addEventListener('click', () => web_filter_list.removeChild(tr));
                    filter_del_btn_holder.appendChild(filter_del_btn);
                tr.appendChild(filter_del_btn_holder)
            web_filter_list.appendChild(tr);
            lock = false
        });


        web_filter_btn_publish.addEventListener('click', () => {
            if (lock) return; lock = true;
            const domains = document.querySelectorAll('.domain');

            if (!allDomainsAreValid(domains)) {
                UIUtils.showSnackbar('Please check your URLs and try again.');
                return;
            }

            const finalFilters = [];

            domains.forEach(domain => {
                const filter = domain.innerHTML.trim();
                finalFilters.push(filter);
            });

            user.getIdToken(true)
            .then(token => {
                return axios.post('/filter-update', {
                    filters: finalFilters,
                    mode: web_filter_mode_label.classList.contains('is-checked').toString()
                }, {
                    headers: {
                        'Authorisation': 'Bearer ' + token
                    }
                });
            }).then(response => {
                const payload = response.data;
                resetFiltersList();
                UIUtils.showSnackbar(payload.message);
                lock = false;
            }).catch(error => {
                console.log(`Error while sending update filter request: ${error}`);
                UIUtils.showSnackbar('An unexpected error occurred. Please try again later.');
                lock = false;
            });
        });

        web_filter_btn_cancel.addEventListener('click', resetFiltersList);

        db.doc(`/users/${user.uid}/filters/filter`).onSnapshot(snapshot => {
            filters = snapshot.data();
            resetFiltersList();
        });

        // #global
        const block_ads = document.getElementById('web-filter__block-ads');
        const block_malicious = document.getElementById('web-filter__block-malicious');
        const dpi = document.getElementById('firewall-rule__dpi');
        const vs = document.getElementById('firewall-rule__vs');
        const global_submit_btn = document.getElementById('global--btn-submit');

        global_submit_btn.addEventListener('click', () => {
            if (lock) return; lock = true;
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
                lock = false;
            }).catch(error => {
                console.error('Error while sending options update request to server: ', error);
                UIUtils.showSnackbar('An unexpected error occurred while trying to update your firewall settings.');
                lock = false;
            });
        });      

        db.doc(`/users/${user.uid}/options/global`)
        .onSnapshot(options => {
            const opts = options.data();
            UIUtils.toggleSwitch(opts.dpi, dpi);
            UIUtils.toggleSwitch(opts.virusScan, vs);
            UIUtils.toggleSwitch(opts.blockAds, block_ads);
            UIUtils.toggleSwitch(opts.blockMalicious, block_malicious);
        }, error => {
            console.log('Error while retrieving data from server: ', error);
            UIUtils.showSnackbar('An unexpected error occurred while retrieving your firewall settings.');
        });
    } else { UIUtils.logoutUI(); }
});