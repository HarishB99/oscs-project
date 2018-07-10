import inspect
def request(flow):
    print(flow.client_conn.ip_address[0][7:])
