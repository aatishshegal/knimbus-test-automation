const fs = require('fs');
const path = './tests/test-data/field-validation-data.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const restoredFields = [
  {
    "scenario": "Affiliation restricts input to 100 characters max",
    "field": "affiliation",
    "validationType": "errorMessage",
    "value": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "bypassLength": true,
    "expectedError": "Maximum 100 characters allowed"
  },
  {
    "scenario": "Department restricts input to 100 characters max",
    "field": "department",
    "validationType": "errorMessage",
    "value": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "bypassLength": true,
    "expectedError": "Maximum 100 characters allowed"
  },
  {
    "scenario": "Degree restricts input to 150 characters max",
    "field": "degree",
    "validationType": "errorMessage",
    "value": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "bypassLength": true,
    "expectedError": "Maximum 150 characters allowed"
  },
  {
    "scenario": "Year restricts input to 4 characters max",
    "field": "year",
    "validationType": "errorMessage",
    "value": "20245",
    "bypassLength": true,
    "expectedError": "Maximum 4 characters allowed"
  },
  {
    "scenario": "ID Document upload rejects file size > 1MB",
    "field": "idDocumentFront",
    "validationType": "fileUpload",
    "value": "large_image.jpg",
    "expectedError": "File size exceeded the maximum limit!"
  },
  {
    "scenario": "ID Document upload rejects invalid format",
    "field": "idDocumentFront",
    "validationType": "fileUpload",
    "value": "invalid_format.pdf",
    "expectedError": "Invalid file format. Only .jpg, .jpeg, .png, image/jpeg, image/png files are allowed."
  }
];

const merged = [...data, ...restoredFields];
fs.writeFileSync(path, JSON.stringify(merged, null, 2));
