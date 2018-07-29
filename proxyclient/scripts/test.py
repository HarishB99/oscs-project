import json
arr = [
    {
        "hi": "bye"
    },
    {
        "hi": "hello"
    }
]

for obj in arr:
    obj["hi"] = "goodbye"

print(json.dumps(arr, indent=4))
