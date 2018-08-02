import pymongo, json

client = pymongo.MongoClient('localhost', 27017)
database = client.logDatabase
users = database.users

u = users.find_one({"_id":"127.0.0.1"})
with open("../data/exampleLogData2.json", "w+") as f:
    for index, item in enumerate(u["timeline"]):
        try:
            item2 = u["timeline"][index + 1]
            if (item["event"] == item2["event"]) and (item["domain"] == item2["domain"]):
                u["timeline"].pop(index + 1)
        except:
            break

        #filter out consecutive repeats
        index = 0
        while index < len(u["timeline"]):
            try:
                item = u["timeline"][index]
                item2 = u["timeline"][index + 1]
                if (item["event"] == item2["event"]) and (item["domain"] == item2["domain"]):
                    u["timeline"].pop(index + 1)
                else:
                    index += 1
            except:
                break

        #filter out non-consecutive repeats
        check = {}
        for index, item in enumerate(u["timeline"]):
            if item["domain"] not in check:
                check[item["domain"]] = {
                    "time": 0,
                    "reason": item["event"]
                }
            if (item["time"] - check[item["domain"]]["time"] < 5) and (item["event"] == check[item["domain"]]["reason"]):
                u["timeline"].pop(index)
            else:
                check[item["domain"]] = {
                    "time": item["time"],
                    "reason": item["event"]
                }
    f.write(json.dumps(u, indent=4))
