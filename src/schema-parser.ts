import { DefineSchema, DefineSchemaJSON } from "./define-schema";
import { DefineDataType, DefineDataTypeJSON } from "./define-data-type";
import { DefineArray } from "./define-array";
import { DefineEnum } from "./define-enum";
import { DefineStruct } from "./define-struct";
import { DefineValidator, DefineValidatorJSON } from "./define-validator";

export class SchemaParser {

  parse(json: DefineSchemaJSON): DefineSchema {
    const schema = new DefineSchema(json.name);
    (<any>schema).id = json.id;

    json.validators.forEach(validatorJSON => {
      const validator = DefineValidator.parse(validatorJSON, schema);
      schema.addValidator(validator);
    });

    json.dataTypes.forEach(dataTypeJSON => {
      let dataType: DefineDataType;
      switch (dataTypeJSON.__type) {
        case 'datatype':
          dataType = DefineDataType.parse(dataTypeJSON, schema);
          break;
        case 'datatype(array)':
          dataType = DefineArray.parse(dataTypeJSON as any, schema);
          break;
        case 'datatype(enum)':
          dataType = DefineEnum.parse(dataTypeJSON as any, schema);
          break;
        case 'datatype(struct)':
          dataType = DefineStruct.parse(dataTypeJSON as any, schema);
          break;
        default:
          throw new Error(`Unknown data type ${ dataTypeJSON.__type }`);
      }
      schema.addDataType(dataType, false);
    });

    return schema;
  }

}