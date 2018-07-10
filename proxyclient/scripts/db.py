import pymongo

class LogDatabase:
    def __init__(self):
        self.client = pymongo.MongoClient('localhost', 27017)
        self.database = client.get_default_database()
        self.logs = self.database['logs']

    def newUser(ip):
        user = {
            "_id": ip,
            "domains" : {},
            "events": {
                "maliciousFile": [],
                "blockedDomains" : {},
                "suspiciousDomain": [],
                "downloadedFile": []
            }
        }
        return true

    def getUser(ip):
        return self.logs.find_one({"_id":ip})

    def updateUser(u):
        self.logs.update_one({'_id':u["_id"]}, {"$set": u}, upsert=False)

    def request(ip, domain):
        u = getUser(ip)
        if u["domains"][domain] is None:
            u["domains"][domain] = 1
        else:
            u["domains"][domain]++
        updateUser(u)

    def securityEvent(ip, eventType, details):
        u = getUser(ip)
        u["events"][eventType].append(details)
        updateUser(u)
