import json

with open('tests/test-data/field-validation-data.json', 'r') as f:
    data = json.load(f)

# Add bypassLength: True to Qualification (Degree) > 150 chars
# Also add the new missing test case for admissionYear
for item in data:
    if item['field'] == 'qualification' and item.get('expectedError') == 'Maximum 150 characters allowed':
        item['bypassLength'] = True

new_case = {
    "scenario": "admission year or year - enter 4 characters anything apart from numbers",
    "field": "admissionYear",
    "validationType": "errorMessage",
    "value": "abcd",
    "expectedError": "Only numbers are allowed"
}

data.append(new_case)

with open('tests/test-data/field-validation-data.json', 'w') as f:
    json.dump(data, f, indent=4)

print("JSON modifications complete.")
