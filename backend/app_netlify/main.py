import json

def handler(event, context):
    print("Simple test function invoked!")
    print(f"Event: {event}")
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps({"message": "Hello from Netlify Function!"})
    }
