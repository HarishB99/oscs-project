from pymongo import MongoClient

client = MongoClient('localhost', 27017)

db = client.log_database
