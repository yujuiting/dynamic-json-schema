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
    const arrayType = new DefineArray(dataType);
    (<any>arrayType).id = json.id;
    arrayType.name = json.name;
    return arrayType;
  }

  private _dataType: WeakDataType = new WeakDataType(this.schema);

  get dataType(): DefineDataType|undefined { return this._dataType.get(); }
  
  set dataType(dataType: DefineDataType|undefined) {
    this._dataType = dataType ? dataType.getWeakDataType() : new WeakDataType(this.schema);
  }

  constructor(dataType: DefineDataType|WeakDataType) {
    super([validators.isArray]);
    this.setDataType(dataType);
  }
  
  getRelevantDataTypes(): DefineDataType[] {
    if (this.dataType) {
      return super.getRelevantDataTypes().concat(this.dataType.getRelevantDataTypes());
    } else {
      return super.getRelevantDataTypes();
    }
  }

  setDataType(dataType: DefineDataType|WeakDataType): void {
    if (dataType instanceof DefineDataType) {
      this.dataType = dataType;
    } else {
      this._dataType = dataType;
    }
  }

  test(value: any): Error[] {
    const errors = super.test(value);
    if (errors.length > 0) {
      return errors;
    }

    const dataType = this.dataType;
    if (!dataType) {
      return [new Error(`Children datatype (${ this._dataType.id }) is missing`)];
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