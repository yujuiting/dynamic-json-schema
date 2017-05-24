const { SchemaImporter }     = require('../dist/schema-importer');
const path = require('path');

const importer = new SchemaImporter();
importer.load(path.join(__dirname, 'my-schema')).subscribe(
  r => console.log(r),
  e => console.log(e),
  () => console.log(importer.get())
);