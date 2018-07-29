class CheckedDomains:
    list = {}

    @staticmethod
    def add(domain, safe, reason, kill):
            if domain in CheckedDomains.list:
                if not safe:
                    CheckedDomains.list[domain]["isSafe"] = False
                    CheckedDomains.list[domain]["reason"].append(reason)
            else:
                CheckedDomains.list[domain] = {
                    "isSafe" : safe,
                    "reason" : [reason],
                    "kill": kill
                }

    @staticmethod
    def search(d):
        if d in CheckedDomains.list:
            return CheckedDomains.list[d]
        else:
            return None
