import json

with open('tests/test-data/field-validation-data.json', 'r') as f:
    data = json.load(f)

# Field standardizations
mapping = {
    'affiliation': 'college',
    'year': 'admissionYear',
    'username': 'FullName',
    'staffid': 'idNumber',
    'staff id': 'idNumber',
    'id number': 'idNumber',
    'degree': 'qualification',
    'qualification / degree / program': 'qualification',
    'speciality': 'areaOfStudy',
    'area of study / speciality': 'areaOfStudy',
    'office phone': 'officePhone',
    'residential phone': 'residentialPhone',
    'office address': 'officeAddress',
    'residential address': 'residentialAddress',
    'full name': 'FullName'
}

new_data = []
seen = set()

for item in data:
    field = item.get('field', '').strip()
    field_lower = field.lower()
    
    # Map field name
    if field_lower in mapping:
        item['field'] = mapping[field_lower]
    
    current_field = item['field']
    value = item.get('value', '')
    
    # Fix expected messages
    if current_field == 'mobile':
        if len(str(value)) < 7 and str(value) != 'BLANK':
            item['expectedError'] = 'Atleast 7 characters required'
        elif len(str(value)) > 20:
            item['expectedError'] = 'Maximum 20 characters allowed'
            
    if current_field == 'qualification':
        if len(str(value)) > 150:
            item['expectedError'] = 'Maximum 150 characters allowed'
            
    # Deduplicate based on field and value combination
    key = (current_field, str(value))
    if key not in seen:
        seen.add(key)
        new_data.append(item)

with open('tests/test-data/field-validation-data.json', 'w') as f:
    json.dump(new_data, f, indent=4)

print(f"Original length: {len(data)}, New length: {len(new_data)}")
