'''
with open('easylist_adservers.txt') as f:
    with open('easylist_adservers-list.txt', 'a+') as f2:
        fl = f.readlines()
        for l in fl:
            l2 = l.replace("|", "")
            l3 = l2.split("^")[0]
            f2.write(l3.strip() + '\n')
'''
'''
with open('easylist_adservers-list.txt') as f:
    with open('ad-domains-list.txt') as f2:
        with open('ad-domains-full.txt', 'a+') as final:
            domains = {}
            for l in f.readlines():
                domains[l.strip()] = True
            for l2 in f2.readlines():
                if l2.strip() not in domains:
                    domains[l2.strip()] = True
            for l3 in domains:
                final.write(l3.strip() + '\n')
'''
'''
import json
with open("fakenews-group-raw.txt") as f:
    fl = f.readlines()
    data = []
    for l in fl:
        if "0.0.0.0" in l:
            data.append(l.split(" ")[1].strip())
    with open("fakenews-group.json", "w+") as f2:
        f2.write(json.dumps(data, indent=4))
'''

import json
with open("fakenews-group.json") as f:
    with open("social-media-group.json") as f2:
        with open("gambling-group.json") as f3:
            with open("pornography-group.json") as f4:
                full = {
                    "fakeNews" : json.loads(f.read()),
                    "socialMedia": json.loads(f2.read()),
                    "gambling" : json.loads(f3.read()),
                    "pornography" : json.loads(f4.read())
                }
                with open("domain-groups.json", "w+") as r:
                    r.write(json.dumps(full, indent=4))
