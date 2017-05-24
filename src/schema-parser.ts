import { DefineSchema, DefineSchemaJSON } from "./define-schema";
import { DefineDataType, DefineDataTypeJSON } from "./define-data-type";
import { DefineArray } from "./define-array";
import { DefineEnum } from "./define-enum";
import { DefineStruct } from "./define-struct";
import { DefineObject } from './define-object';
import { DefineValidator, DefineValidatorJSON } from "./define-validator";
import { isSchemaJSON,
         isValidatorJSON,
         isDataTypeJSON,
         isEnumTypeJSON,
         isArrayTypeJSON,
         isStructTypeJSON } from './utilities';

export class SchemaParser {

  private schema: DefineSchema;

  constructor(private files: any[]) {}

  get(): DefineSchema {
     return !this.schema ? this.parse() : this.schema;
  }

  parse(): DefineSchema {
    this.schema = new DefineSchema('undefined');
    this.files.forEach(file => {
      const object = this.parseFile(file);
      if (object instanceof DefineValidator) {
        this.schema.addValidator(object)
      } else if (object instanceof DefineDataType) {
        this.schema.addDataType(object);
      }
    });
    return this.schema;
  }

  parseFile(file: any): DefineObject {
    try {
      const json = typeof file === 'string' ? JSON.parse(file) : file;

      if (isSchemaJSON(json)) {
        this.schema.name = json.name;
        (<any>this.schema).__id = json.__id;
        return this.schema;
      }

      if (isValidatorJSON(json)) {
        return DefineValidator.parse(json);
      }

      if (isEnumTypeJSON(json)) {
        return DefineEnum.parse(json, this.schema);
      }

      if (isArrayTypeJSON(json)) {
        return DefineArray.parse(json, this.schema);
      }

      if (isStructTypeJSON(json)) {
        return DefineStruct.parse(json, this.schema);
      }

      if (isDataTypeJSON(json)) {
        return DefineDataType.parse(json);
      }
    } catch (err) {
      console.warn(file);
      throw err;
    }
  }

  // parse(json: DefineSchemaJSON): DefineSchema {
  //   const schema = new DefineSchema(json.name);
  //   (<any>schema).__id= json.__id;

  //   json.validators.forEach(validatorJSON => {
  //     const validator = DefineValidator.parse(validatorJSON, schema);
  //     schema.addValidator(validator);
  //   });

  //   json.dataTypes.forEach(dataTypeJSON => {
  //     let dataType: DefineDataType;
  //     switch (dataTypeJSON.__type) {
  //       case 'datatype':
  //         dataType = DefineDataType.parse(dataTypeJSON, schema);
  //         break;
  //       case 'datatype(array)':
  //         dataType = DefineArray.parse(dataTypeJSON as any, schema);
  //         break;
  //       case 'datatype(enum)':
  //         dataType = DefineEnum.parse(dataTypeJSON as any, schema);
  //         break;
  //       case 'datatype(struct)':
  //         dataType = DefineStruct.parse(dataTypeJSON as any, schema);
  //         break;
  //       default:
  //         throw new Error(`Unknown data type ${ dataTypeJSON.__type }`);
  //     }
  //     schema.addDataType(dataType, false);
  //   });

  //   return schema;
  // }

}