from nimbella import redis

def main(args):
    db = redis()
    if "key" in args:
       key = args['key']
       if "value" in args:
           db.hset("nimbots", key , args['value'])
           return { "body": "added "+key}
       else:
           db.hdel("nimbots", args['key'])
           return { "body": "removed "+key}

