import json

with open('tests/test-data/field-validation-data.json', 'r') as f:
    data = json.load(f)

for item in data:
    if item['scenario'] == 'mobile - Blank/Unselected':
        item['expectedError'] = 'Mobile is required (7-20 numbers)'
    if item['scenario'] == 'Mobile restricts input to less than 7 characters':
        item['expectedError'] = 'Atleast 7 characters required'

with open('tests/test-data/field-validation-data.json', 'w') as f:
    json.dump(data, f, indent=4)

print("JSON modifications complete.")
