import pymongo, time

class LogDatabase:
    client = pymongo.MongoClient('localhost', 27017)
    database = client.logDatabase
    users = database.users

    @staticmethod
    def newUser(ip):
        user = {
            "_id": ip,
            "domains" : {},
            "events": {
                "blockedDomains" : {},
                "suspiciousDomain": {},
                "childUnsafe": {},
                "downloadedFile": [],
                "maliciousFile": []
            },
            "timeline":[]
        }
        return LogDatabase.users.insert_one(user)

    @staticmethod
    def getUser(ip):
        u = LogDatabase.users.find_one({"_id":ip})
        if u is None:
            LogDatabase.newUser(ip)
            return LogDatabase.getUser(ip)
        else:
            return u

    @staticmethod
    def updateUser(u):
        LogDatabase.users.update_one({'_id':u["_id"]}, {"$set": u}, upsert=False)

    @staticmethod
    def timelineAdd(ip, event, domain):
        u = LogDatabase.getUser(ip)
        if "timeline" not in u:
            u["timeline"] = []

        u["timeline"].append({
            "time" : time.time(),
            "event" : event,
            "domain" : domain
        })

        LogDatabase.updateUser(u)

    @staticmethod
    def request(ip, domain):
        u = LogDatabase.getUser(ip)
        if domain not in u["domains"]:
            u["domains"][domain] = 1
        else:
            u["domains"][domain] += 1
        LogDatabase.updateUser(u)
        LogDatabase.timelineAdd(ip, "request", domain)

    @staticmethod
    def blockedDomain(ip, domain):
        u = LogDatabase.getUser(ip)
        if domain not in u["events"]["blockedDomains"]:
            u["events"]["blockedDomains"][domain] = 1
        else:
            u["events"]["blockedDomains"][domain] += 1
        LogDatabase.updateUser(u)
        LogDatabase.timelineAdd(ip, "Requested blocked domain", domain)

    @staticmethod
    def securityEvent(ip, domain, eventType):
        u = LogDatabase.getUser(ip)
        if eventType not in u["events"]:
            u["events"][eventType] = {}
        if domain not in u["events"][eventType]:
            u["events"][eventType][domain] = 1
        else:
            u["events"][eventType][domain] += 1
        LogDatabase.updateUser(u)
        LogDatabase.timelineAdd(ip, "Security event: "+eventType, domain)

    @staticmethod
    def downloadFile(ip, domain, url, safe):
        u = LogDatabase.getUser(ip)
        if "downloadedFile" not in u["events"]:
            u["events"]["downloadedFile"] = []

        downloadLog = {
        "domain" : domain,
        "url" : url,
        "safe" : safe,
        "time" : time.time()
        }

        if safe:
            u["events"]["downloadedFile"].append(downloadLog)
            LogDatabase.timelineAdd(ip, "Download File", domain)
        if not safe:
            u["events"]["maliciousFile"].append(downloadLog)
            LogDatabase.timelineAdd(ip, "Download malicious file", domain)

        LogDatabase.updateUser(u)
