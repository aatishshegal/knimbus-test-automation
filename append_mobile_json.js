const fs = require('fs');
const path = './tests/test-data/field-validation-data.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const restoredFields = [
  {
    "scenario": "Mobile restricts input to less than 7 characters",
    "field": "mobile",
    "validationType": "errorMessage",
    "value": "12345",
    "expectedError": "Mobile Number should be between 7-20 digit"
  },
  {
    "scenario": "Mobile restricts input to more than 20 characters",
    "field": "mobile",
    "validationType": "errorMessage",
    "value": "1234567890123456789012",
    "bypassLength": true,
    "expectedError": "Mobile Number should be between 7-20 digit"
  }
];

const merged = [...data, ...restoredFields];
fs.writeFileSync(path, JSON.stringify(merged, null, 2));
