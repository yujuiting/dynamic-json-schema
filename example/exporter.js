const { DefineDataType } = require('../dist/define-data-type');
const { DefineArray }    = require('../dist/define-array');
const { DefineStruct }   = require('../dist/define-struct');
const { DefineEnum }     = require('../dist/define-enum');
const { DefineSchema, runtimeSchema }   = require('../dist/define-schema');
const { SchemaParser }   = require('../dist/schema-parser');
const { SchemaExporter } = require('../dist/schema-exporter');
const { isString, isNumber, isObject, isArray, isBoolean, maxStringLength, isContainedIn } = require('../dist/validators');
const path = require('path');

const string_type = new DefineDataType('string', [isString]);

const boolean_type = new DefineDataType('boolean', [isBoolean]);

const number_type = new DefineDataType('number', [isNumber]);

const controller_type = new DefineDataType('controller-type', [
  isContainedIn.use(['KeyboardAndMouse', 'DualShock', 'XBox'])
]);

const input_mapping_type = new DefineStruct('input-mapping', {
  "Name": string_type,
  "ControllerType": controller_type,
  "Category": string_type,
  "ContextType": string_type,
  "Command": string_type,
  "IsAxis": boolean_type,
  "Scale": number_type,
  "PressingShift": boolean_type,
  "PressingCtrl": boolean_type,
  "PressingAtl": boolean_type,
  "PressingCmd": boolean_type
});

const exporter = new SchemaExporter(runtimeSchema);
exporter.save(path.join(__dirname, 'my-schema')).subscribe(
  r => console.log(r),
  err => console.log(err)
);