import { DefineDataType, DefineDataTypeJSON, WeakDataType } from './define-data-type';
import { DefineSchema, runtimeSchema } from "./define-schema";
import * as validators from './validators';

export interface DefineArrayJSON extends DefineDataTypeJSON {
  dataType: string;
}

export class DefineArray extends DefineDataType {
  
  static parse(json: DefineArrayJSON, schema: DefineSchema = runtimeSchema): DefineArray {
    // TODO: here should get weak object
    const dataType = new WeakDataType(schema, json.dataType);
    const arrayType = new DefineArray(json.name, dataType);
    (<any>arrayType).__id= json.__id;
    arrayType.name = json.name;
    return arrayType;
  }

  dataType: WeakDataType = new WeakDataType(this.schema);

  constructor(name: string, dataType: DefineDataType|WeakDataType) {
    super(name, [validators.isArray]);
    (<any>this).__type = 'datatype(array)';
    this.setDataType(dataType);
  }
  
  getRelevantDataTypes(): DefineDataType[] {
    const dataType = this.dataType.get();

    if (dataType) {
      return super.getRelevantDataTypes().concat(dataType.getRelevantDataTypes());
    } else {
      return super.getRelevantDataTypes();
    }
  }

  setDataType(dataType: DefineDataType|WeakDataType): void {
    if (dataType instanceof DefineDataType) {
      this.dataType = dataType.getWeakDataType();
    } else {
      this.dataType = dataType;
    }
  }

  test(value: any): Error[] {
    const errors = super.test(value);
    if (errors.length > 0) {
      return errors;
    }

    const dataType = this.dataType.get();
    if (!dataType) {
      return [new Error(`Children datatype (${ this.dataType.id }) is missing`)];
    }

    value.forEach((item, index) =>
      dataType.test(item).forEach(err => errors.push(err)));
    return errors;
  }

  toJSON(): DefineArrayJSON {
    const json = super.toJSON() as DefineArrayJSON;
    json.__type = 'datatype(array)';
    json.dataType = this.dataType ? this.dataType.id : '';
    return json;
  }
}