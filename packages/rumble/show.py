from nimbella import redis

def main(args):
        db = redis()
        if "key" in args:
            return {
                "body": db.hget("nimbots", args["key"]).decode("utf-8")
            }
        else: 
            return {
                "body": [i.decode('utf-8') for i in db.hkeys("nimbots")]
            }
