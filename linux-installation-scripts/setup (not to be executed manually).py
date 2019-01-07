import os
import subprocess
import json

config_file = os.path.join(os.path.expanduser('~'), 'oscs-project/proxyclient/data/proxy.config')
binpath = subprocess.check_output(['which', 'mongod']).decode('utf-8')[:-1]

with open(config_file, 'r+') as f:
	config = json.load(f)
	config['mongo'] = binpath
	f.seek(0)
	json.dump(config, f, indent=4)
	f.truncate()


data = {}
data['webOfTrust'] = '390f9bd0aad758a356a40ba7858ca67b2089885f'
data['googleSafeBrowsing'] = 'AIzaSyANNSsma-RHsoH7X05wEUOGbPsl-G9vdU8'
data['virusTotal'] = '828ae74d8111c536f1206731c1a3203805e5e7efe8409227cc5a5effa4285601'

key_file = os.path.join(os.path.expanduser('~'), 'oscs-project/proxyclient/data/apiKeys.json')

with open(key_file, 'w') as f:
	json.dump(data, f, indent=4)

