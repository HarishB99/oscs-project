import pymongo

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
                "maliciousFile": [],
                "blockedDomains" : {},
                "suspiciousDomain": {},
                "questionableDomain": {},
                "childUnsafe": {},
                "downloadedFile": []
            }
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
    def request(ip, domain):
        u = LogDatabase.getUser(ip)
        if domain not in u["domains"]:
            u["domains"][domain] = 1
        else:
            u["domains"][domain] += 1
        LogDatabase.updateUser(u)

    @staticmethod
    def blockedDomain(ip, domain):
        u = LogDatabase.getUser(ip)
        if domain not in u["events"]["blockedDomains"]:
            u["events"]["blockedDomains"][domain] = 1
        else:
            u["events"]["blockedDomains"][domain] += 1
        LogDatabase.updateUser(u)

    def securityEvent(ip, domain, eventType):
        u = LogDatabase.getUser(ip)
        if u["events"][eventType] is None:
            u["events"][eventType] = {}
        if u["events"][eventType][domain] is None:
            u["events"][eventType][domain] = 1
        else u["events"][eventType][domain] += 1
        LogDatabase.updateUser(u)
