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

        // #firewall-rule__table
        const mdl_spinner_holder = document.getElementById('mdl-spinner--holder');
        const ruleRowsName = 'rules';
        const rule_add_btn = document.getElementById('firewall-rule__button--add');

        rule_add_btn.addEventListener('click', () => {
            if (lock) return; lock = true;
            location.href = '/create_rule';
            lock = false;
        });

        const showVerifyEmail = function(tbody) {
            UIUtils.toggleLoader(false, mdl_spinner_holder);
            const tr = document.createElement('tr');
            tr.className = ruleRowsName;
                const noRules = document.createElement('td');
                    noRules.className = "mdl-data-table__cell--non-numeric rule";
                    noRules.colSpan = 10;
                    noRules.innerHTML = "Please verify your email before you proceed.";
                tr.appendChild(noRules);
            tbody.appendChild(tr);
        };

        const db = firebase.firestore();
        db.settings({timestampsInSnapshots: true});

        const tbody = document.getElementById('firewall-rule__table--list');

        db.collection(`/users/${user.uid}/rules`).onSnapshot(rules => {
            UIUtils.toggleLoader(true, mdl_spinner_holder);
            
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
                            sip.innerHTML = (sourceip === "0.0.0.0") ? "any" : sourceip;
                        const sport = document.createElement("td");
                            sport.className = "sport";
                            sport.innerHTML = (sourceport === "*") ? "any" : sourceport;
                        const dip = document.createElement("td");
                            dip.className = "daddr";
                            dip.innerHTML = (destip === "0.0.0.0") ? "any" : destip;
                        const dport = document.createElement("td");
                            dport.className = "dport";
                            dport.innerHTML = (destport === "*") ? "any" : destport;
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
                                    if (error.code === 'auth/invalid-user-token' || error.code === 'auth/user-token-expired') {
                                        firebase.auth().signOut()
                                        .catch(() => {
                                            UIUtils.showSnackbar('You have to logout and login again to perform this action.');
                                            lock = false;
                                        });
                                    } else if (error.code === 'auth/network-request-failed') {
                                        UIUtils.showSnackbar('Please check your network connection and try again.');
                                    } else if (error.code === 'auth/user-disabled') {
                                        UIUtils.showSnackbar('Your account has been disabled. Please logout and login before trying again.');
                                    } else {
                                        UIUtils.showSnackbar('An unexpected error occurred. Please try again later.');
                                    }
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
                                    if (error.code === 'auth/invalid-user-token' || error.code === 'auth/user-token-expired') {
                                        firebase.auth().signOut()
                                        .catch(() => {
                                            UIUtils.showSnackbar('You have to logout and login again to perform this action.');
                                            lock = false;
                                        });
                                    } else if (error.code === 'auth/network-request-failed') {
                                        UIUtils.showSnackbar('Please check your network connection and try again.');
                                    } else if (error.code === 'auth/user-disabled') {
                                        UIUtils.showSnackbar('Your account has been disabled. Please logout and login before trying again.');
                                    } else {
                                        UIUtils.showSnackbar('An unexpected error occurred. Please try again later.');
                                    }
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
            if (error.message === "Missing or insufficient permissions.") {
                UIUtils.showSnackbar('Please verify your email before you proceed to manage your firewall proxy.');
                showVerifyEmail(tbody);
            } else {
                UIUtils.showSnackbar('We are unable to retrieve your firewall rules. Please try again later.');
            }
        });

        // #web-filter
        let filters = '';
        const web_filter_dg_fakenews = document.getElementById('web-filter__domain-grp--fake-news');
        const web_filter_dg_socialmedia = document.getElementById('web-filter__domain-grp--social-media');
        const web_filter_dg_gamble = document.getElementById('web-filter__domain-grp--gambling');
        const web_filter_dg_pornography = document.getElementById('web-filter__domain-grp--pornography');

        const web_filter_list_black = document.getElementById('web-filter__tbody--black-list');
        const web_filter_domain_black = document.getElementById('web-filter__domain--black-list');
        const web_filter_btn_add_black = document.getElementById('web-filter__btn-add--black-list');

        const web_filter_list_white = document.getElementById('web-filter__tbody--white-list');
        const web_filter_domain_white = document.getElementById('web-filter__domain--white-list');
        const web_filter_btn_add_white = document.getElementById('web-filter__btn-add--white-list');
        
        const web_filter_btn_publish = document.getElementById('web-filter__btn-submit');
        const web_filter_btn_cancel = document.getElementById('web-filter__btn-cancel');

        const checkAllInputsBlack = function() {
            UIUtils.update_text_field_ui(web_filter_domain_black, 
                InputValidator.isValidDomain(web_filter_domain_black.value));
        };

        const checkAllInputsWhite = function() {
            UIUtils.update_text_field_ui(web_filter_domain_white, 
                InputValidator.isValidDomain(web_filter_domain_white.value));
        };

        const allDomainsAreValid = function(domains) {
            for (let i = 0; i < domains.length; i++) {
                let filter = domains[i].innerHTML;
                filter = filter.trim();
                if (!InputValidator.isValidDomain(filter)) {
                    return false;
                }
            }
            return true;
        };

        const resetFiltersList = function () {
            // Reset web_filter_lists
            web_filter_list_black.innerHTML = '';
            web_filter_list_white.innerHTML = '';

            filters.whitelist.forEach(domain => {
                const tr = document.createElement('tr');
                    const domain_holder = document.createElement('td');
                        domain_holder.className = 'domain domain--white mdl-data-table__cell--non-numeric';
                        domain_holder.innerHTML = domain;
                    tr.appendChild(domain_holder);
                    const filter_del_btn_holder = document.createElement('td');
                        const filter_del_btn = document.createElement('button');
                            filter_del_btn.className = 'mdl-button mdl-js-button mdl-button--icon';
                            filter_del_btn.innerHTML = '<i class=\"material-icons\">cancel</i>';
                            filter_del_btn.addEventListener('click', () => {
                                if (lock) return; lock = true;
                                web_filter_list_white.removeChild(tr)
                                lock = false
                            });
                        filter_del_btn_holder.appendChild(filter_del_btn);
                    tr.appendChild(filter_del_btn_holder)
                web_filter_list_white.appendChild(tr);
            });
            filters.blacklist.forEach(domain => {
                const tr = document.createElement('tr');
                    const domain_holder = document.createElement('td');
                        domain_holder.className = 'domain domain--black mdl-data-table__cell--non-numeric';
                        domain_holder.innerHTML = domain;
                    tr.appendChild(domain_holder);
                    const filter_del_btn_holder = document.createElement('td');
                        const filter_del_btn = document.createElement('button');
                            filter_del_btn.className = 'mdl-button mdl-js-button mdl-button--icon';
                            filter_del_btn.innerHTML = '<i class=\"material-icons\">cancel</i>';
                            filter_del_btn.addEventListener('click', () => {
                                if (lock) return; lock = true;
                                web_filter_list_black.removeChild(tr)
                                lock = false
                            });
                        filter_del_btn_holder.appendChild(filter_del_btn);
                    tr.appendChild(filter_del_btn_holder)
                web_filter_list_black.appendChild(tr);
            });

            UIUtils.toggleSwitch(filters.fakeNews, web_filter_dg_fakenews);
            UIUtils.toggleSwitch(filters.socialMedia, web_filter_dg_socialmedia);
            UIUtils.toggleSwitch(filters.gambling, web_filter_dg_gamble);
            UIUtils.toggleSwitch(filters.pornography, web_filter_dg_pornography);
        }

        web_filter_domain_black.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidDomain(e.target.value));
        });

        web_filter_domain_white.addEventListener('keyup', e => {
            UIUtils.update_text_field_ui(e.target, 
                InputValidator.isValidDomain(e.target.value));
        });

        web_filter_btn_add_black.addEventListener('click', () => {
            if (lock) return; lock = true;
            checkAllInputsBlack();
        
            if (UIUtils.stillAnyInvalid()) return;

            const tr = document.createElement('tr');
                const domain = document.createElement('td');
                    domain.className = 'domain domain--black mdl-data-table__cell--non-numeric';
                    domain.innerHTML = web_filter_domain_black.value;
                tr.appendChild(domain);
                const filter_del_btn_holder = document.createElement('td');
                    const filter_del_btn = document.createElement('button');
                        filter_del_btn.className = 'mdl-button mdl-js-button mdl-button--icon';
                        filter_del_btn.innerHTML = '<i class=\"material-icons\">cancel</i>';
                        filter_del_btn.addEventListener('click', () => web_filter_list_black.removeChild(tr));
                    filter_del_btn_holder.appendChild(filter_del_btn);
                tr.appendChild(filter_del_btn_holder)
            web_filter_list_black.appendChild(tr);
            lock = false
        });

        web_filter_btn_add_white.addEventListener('click', () => {
            if (lock) return; lock = true;
            checkAllInputsWhite();
        
            if (UIUtils.stillAnyInvalid()) return;

            const tr = document.createElement('tr');
                const domain = document.createElement('td');
                    domain.className = 'domain domain--white mdl-data-table__cell--non-numeric';
                    domain.innerHTML = web_filter_domain_white.value;
                tr.appendChild(domain);
                const filter_del_btn_holder = document.createElement('td');
                    const filter_del_btn = document.createElement('button');
                        filter_del_btn.className = 'mdl-button mdl-js-button mdl-button--icon';
                        filter_del_btn.innerHTML = '<i class=\"material-icons\">cancel</i>';
                        filter_del_btn.addEventListener('click', () => web_filter_list_white.removeChild(tr));
                    filter_del_btn_holder.appendChild(filter_del_btn);
                tr.appendChild(filter_del_btn_holder)
            web_filter_list_white.appendChild(tr);
            lock = false
        });

        web_filter_btn_publish.addEventListener('click', () => {
            if (lock) return; lock = true;
            const domains = document.querySelectorAll('.domain');

            if (!allDomainsAreValid(domains)) {
                UIUtils.showSnackbar('Please check your URLs and try again.');
                return;
            }

            const finalWhitelistDomains = [];
            const finalBlacklistDomains = [];

            const whitelistDomains = document.querySelectorAll('.domain--white');
            const blacklistDomains = document.querySelectorAll('.domain--black');

            whitelistDomains.forEach(domain => {
                const filter = domain.innerHTML.trim();
                finalWhitelistDomains.push(filter);
            });
            blacklistDomains.forEach(domain => {
                const filter = domain.innerHTML.trim();
                finalBlacklistDomains.push(filter);
            });

            user.getIdToken(true)
            .then(token => {
                return axios.post('/filter-update', {
                    blacklist: finalBlacklistDomains,
                    whitelist: finalWhitelistDomains,

                    fakeNews: web_filter_dg_fakenews.parentElement.classList.contains('is-checked').toString(),
                    socialMedia: web_filter_dg_socialmedia.parentElement.classList.contains('is-checked').toString(),
                    gambling: web_filter_dg_gamble.parentElement.classList.contains('is-checked').toString(),
                    pornography: web_filter_dg_pornography.parentElement.classList.contains('is-checked').toString()
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
                if (error.code === 'auth/invalid-user-token' || error.code === 'auth/user-token-expired') {
                    firebase.auth().signOut()
                    .catch(() => {
                        UIUtils.showSnackbar('You have to logout and login again to perform this action.');
                        lock = false;
                    });
                } else if (error.code === 'auth/network-request-failed') {
                    UIUtils.showSnackbar('Please check your network connection and try again.');
                } else if (error.code === 'auth/user-disabled') {
                    UIUtils.showSnackbar('Your account has been disabled. Please logout and login before trying again.');
                } else {
                    UIUtils.showSnackbar('An unexpected error occurred. Please try again later.');
                }
                lock = false;
            });
        });

        web_filter_btn_cancel.addEventListener('click', resetFiltersList);

        db.doc(`/users/${user.uid}/filters/filter`).onSnapshot(snapshot => {
            filters = snapshot.data();
            resetFiltersList();
        }, error => {
            if (error.message === "Missing or insufficient permissions.") {
                UIUtils.showSnackbar('Please verify your email before you proceed to manage your firewall proxy.');
            } else {
                UIUtils.showSnackbar('We are unable to retrieve your web filters. Please try again later.');
            }
        });

        // #global
        const block_ads = document.getElementById('web-filter__block-ads');
        const block_malicious = document.getElementById('web-filter__block-malicious');
        const vs = document.getElementById('firewall-rule__vs');
        const cs = document.getElementById('firewall-rule__cs');
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
                        childSafety: cs.parentElement.classList.contains('is-checked').toString(),
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
                if (error.code === 'auth/invalid-user-token' || error.code === 'auth/user-token-expired') {
                    firebase.auth().signOut()
                    .catch(() => {
                        UIUtils.showSnackbar('You have to logout and login again to perform this action.');
                        lock = false;
                    });
                } else if (error.code === 'auth/network-request-failed') {
                    UIUtils.showSnackbar('Please check your network connection and try again.');
                } else if (error.code === 'auth/user-disabled') {
                    UIUtils.showSnackbar('Your account has been disabled. Please logout and login before trying again.');
                } else {
                    UIUtils.showSnackbar('An unexpected error occurred. Please try again later.');
                }
                lock = false;
            });
        });

        if (!user.emailVerified) {
            rule_add_btn.disabled = true;
            if (!InputValidator.isEmpty(document.querySelectorAll('.firewall-rule__button--delete'))) {
                document.querySelectorAll('.firewall-rule__button--delete')
                .forEach(delBtn => {
                    delBtn.disabled = true;
                });
            }
            if (!InputValidator.isEmpty(document.querySelectorAll('.firewall-rule__button--edit'))) {
                document.querySelectorAll('.firewall-rule__button--edit')
                .forEach(btn => {
                    btn.disabled = true;
                });
            }
            global_submit_btn.disabled = true;
        }

        db.doc(`/users/${user.uid}/options/global`)
        .onSnapshot(options => {
            const opts = options.data();
            UIUtils.toggleSwitch(opts.childSafety, cs);
            UIUtils.toggleSwitch(opts.virusScan, vs);
            UIUtils.toggleSwitch(opts.blockAds, block_ads);
            UIUtils.toggleSwitch(opts.blockMalicious, block_malicious);
        }, error => {
            if (error.message === "Missing or insufficient permissions.") {
                UIUtils.showSnackbar('Please verify your email before you proceed to manage your firewall proxy.');
            } else {
                UIUtils.showSnackbar('An unexpected error occurred while retrieving your firewall settings.');
            }
        });
    } else { UIUtils.logoutUI(); }
});