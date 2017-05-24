const { DefineDataType } = require('../dist/define-data-type');
const { DefineArray }    = require('../dist/define-array');
const { DefineStruct }   = require('../dist/define-struct');
const { DefineEnum }     = require('../dist/define-enum');
const { DefineSchema }   = require('../dist/define-schema');
const { SchemaParser }   = require('../dist/schema-parser');
const { isString, isNumber, isObject, isArray, isBoolean, maxStringLength } = require('../dist/validators');
const fs = require('fs');
const path = require('path');

const writemode = true;

let schema;
const parser = new SchemaParser();

if (writemode) {
  schema = new DefineSchema('my-schema');
  const name_t = new DefineDataType([isString, maxStringLength.use(8)]);
  name_t.name = 'name_t';

  const weapon_type_t = new DefineEnum([
    { key: 'sword',   value: 0 },
    { key: 'hammer',  value: 1 },
    { key: 'dagger',  value: 2 }
  ]);
  weapon_type_t.name = 'weapon_type_t';

  const weapon_t = new DefineStruct({
    type: weapon_type_t,
    name: name_t
  });
  weapon_t.name = 'weapon_t';

  const weapon_list_t = new DefineArray(weapon_t);
  weapon_list_t.name = 'weapon_list_t';

  schema.addDataType(weapon_list_t);
  console.log(schema.toJSON());
} else {
  const filedata = fs.readFileSync(path.join(__dirname, 'my-schema.json'), 'utf-8');
  const json = JSON.parse(filedata);
  schema = parser.parse(json);
}

const weapon_list_t = schema.findDataTypeByName('weapon_list_t');

const valid_data = [
  { type: 0, name: 'a sword' },
  { type: 1, name: 'a hammer' },
  { type: 2, name: 'a dagger' }
];

const should_not_have_errors = weapon_list_t.test(valid_data);
console.log('should_not_have_errors:\n', should_not_have_errors);

const invalid_data = [
  { type: 4, name: 'a sword' },
  { type: 1, name: 'name too long' },
  { type: 2, name2: 'property incorrect' }
];

const should_have_errors = weapon_list_t.test(invalid_data);
console.log('should_have_errors:\n', should_have_errors);

if (writemode) {
  const json = schema.toJSON();
  const filedata = JSON.stringify(json, null, 2);
  const writestream = fs.createWriteStream(path.join(__dirname, 'my-schema.json'));
  writestream.write(filedata, 'utf-8', () => writestream.close());
}
