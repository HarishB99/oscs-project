class CheckedDomains:
    list = {}

    @staticmethod
    def add(domain, safe, reason):
            if domain in CheckedDomains.list:
                if not safe:
                    CheckedDomains.list[domain]["isSafe"] = False
                    reason.append(reason)
            else:
                CheckedDomains.list[domain] = {
                    "isSafe" : safe,
                    "reason" : [reason]
                }

    @staticmethod
    def search(d):
        if d in CheckedDomains.list:
            return CheckedDomains.list[d]
        else:
            return None
