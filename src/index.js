require('babel-polyfill');
const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/firestore');
const InputValidator = require('./modules/InputValidator').default;
const UIUtils = require('./modules/UIUtils').default;
const config = require('./modules/config').config;

firebase.initializeApp(config);

const auth = firebase.auth();
const db = firebase.firestore();
db.settings({
    timestampsInSnapshots: true
});

auth.onAuthStateChanged(user => {
    document.getElementById('firewall-rule__button--add')
    .addEventListener('click', e => {
        location.href = '/create_rule';
    });

    if (!InputValidator.isEmpty(user)) {
        db.collection('users').doc(user.uid)
        .collection('rules').onSnapshot(rules => {
            const tbody = document.getElementById('firewall-rule__table--list');
            // Reset table body
            tbody.innerHTML = '';
            if (rules.empty) {
                const tr = document.createElement('tr');
                    const noRule = document.createElement('td');
                        noRules.className = "mdl-data-table__cell--non-numeric rule";
                        noRules.colSpan = 9;
                        noRules.innerHTML = "You have not configured any rules.";
                    tr.appendChild(noRule);
                tbody.appendChild(tr);
            } else {
                // Rules is not empty
                rules.forEach(rule => {
                    const params = rule.data();
                    const {
                        name, 
                        priority, 
                        sourceip, 
                        sourceport, 
                        destip, 
                        destport, 
                        protocol
                    } = params;
                    const allow = params.allow ? "Allow" : "Deny";

                    const tr = document.createElement('tr');
                        const ruleName = document.createElement("td");
                            ruleName.className = "mdl-data-table__cell--non-numeric rule";
                            ruleName.innerHTML = name;
                        const access = document.createElement("td");
                            access.className = "access";
                            access.innerHTML = allow;
                        const prior = document.createElement("td");
                            prior.className = "priority";
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
                        const buttonsHolder = document.createElement("td");
                            const editBtn = document.createElement("button");
                            editBtn.className = "firewall-rule__button--edit mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect";
                            editBtn.innerHTML = "<i class=\"material-icons\">edit</i> Edit";
                            editBtn.style.width = "100%";
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
                        tr.appendChild(ruleName);
                        tr.appendChild(access);
                        tr.appendChild(prior);
                        tr.appendChild(sip);
                        tr.appendChild(sport);
                        tr.appendChild(dip);
                        tr.appendChild(dport);
                        tr.appendChild(proto);
                        tr.appendChild(buttonsHolder);
                    tbody.appendChild(tr);
                });
            }
            const options = {
                valueNames: ['rule', 'access', 'priority', 
                'saddr','sport', 'daddr', 'dport', 'protocol']
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