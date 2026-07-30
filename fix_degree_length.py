import json

with open('tests/test-data/field-validation-data.json', 'r') as f:
    data = json.load(f)

for item in data:
    if item['scenario'] == 'Degree restricts input to 150 characters max':
        item['value'] = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" + "AAA"
        item['bypassLength'] = True

with open('tests/test-data/field-validation-data.json', 'w') as f:
    json.dump(data, f, indent=4)

print("JSON modifications complete.")
