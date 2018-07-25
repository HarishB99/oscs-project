import argparse, subprocess

#argument parser
parser = argparse.ArgumentParser()
parser.add_argument("port", help="port that the proxy will work off", type=int)
parser.add_argument("-u", "--user")
parser.add_argument("-p", "--password")
parser.add_argument("-w", "--web-port", default=3000)
parser.add_argument("-m", "--mitm-port", default=8080)
parser.add_argument("-n", "--no-sync", help="Do not attempt to sync rules",
 action="store_true")
