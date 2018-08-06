cd firegate101-client
node index.js &
cd ../proxyclient
mongod --dbpath data/mongodb &
cd scripts
python3.6 startproxy.py
