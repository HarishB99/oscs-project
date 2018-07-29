'''
with open('easylist_adservers.txt') as f:
    with open('easylist_adservers-list.txt', 'a+') as f2:
        fl = f.readlines()
        for l in fl:
            l2 = l.replace("|", "")
            l3 = l2.split("^")[0]
            f2.write(l3.strip() + '\n')
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
