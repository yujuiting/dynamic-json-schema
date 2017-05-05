import { DefineObject, DefineObjectJSON } from './define-object';
import { DefineDataType, WeakDataType } from './define-data-type';
import { DefineStruct } from './define-struct';
import { DefineSchema, runtimeSchema } from "./define-schema";

export interface DefinePropertyJSON extends DefineObjectJSON {
  dataType: string;
  allowNull?: boolean;
}

export interface DefinePropertyOptions {
  dataType?: DefineDataType;
  allowNull?: boolean;
}

export class DefineProperty extends DefineObject {

  static parse(json: DefinePropertyJSON, schema: DefineSchema = runtimeSchema): DefineProperty {
    const dataType = new WeakDataType(schema, json.dataType);
    const prop = new DefineProperty(dataType, { allowNull: json.allowNull });
    (<any>prop).id = json.id;
    prop.name = json.name;
    return prop;
  }

  schema: DefineSchema = runtimeSchema;
  
  allowNull = false;

  private _dataType: WeakDataType = new WeakDataType(this.schema);

  get dataType(): DefineDataType|undefined { return this._dataType.get(); }
  
  set dataType(dataType: DefineDataType|undefined) {
    this._dataType = dataType ? dataType.getWeakDataType() : new WeakDataType(this.schema);
  }

  constructor(dataTypeOrOptions: DefineDataType|WeakDataType|DefinePropertyOptions,
              public options: DefinePropertyOptions = {}) {
    super();

    if (dataTypeOrOptions instanceof DefineDataType ||
        dataTypeOrOptions instanceof WeakDataType) {

      this.setDataType(dataTypeOrOptions);
      this.allowNull = options.allowNull !== void 0 ? options.allowNull : this.allowNull;

    } else {

      if (dataTypeOrOptions.dataType !== void 0) {
        this.setDataType(dataTypeOrOptions.dataType);
      }
      this.allowNull = dataTypeOrOptions.allowNull !== void 0 ? dataTypeOrOptions.allowNull : this.allowNull;

    }
  }

  setDataType(dataType: DefineDataType|WeakDataType) {
    if (dataType instanceof DefineDataType) {
      this.dataType = dataType;
    } else {
      this._dataType = dataType;
    }
  }

  test(value: any): Error[] {
    let errors: Error[] = [];
    if (value === void 0 || value === null) {
      if (this.allowNull) {
        return errors;
      }
      errors.push(new Error(`Property ${ this.name } is required`));
      return errors;
    }

    errors = this.dataType ?
             this.dataType.test(value) :
             [new Error(`Missing datatype (${ this._dataType.id })`)];
    
    return errors;
  }

  toJSON(): DefinePropertyJSON {
    return {
      __type: 'property',
      id: this.id,
      name: this.name,
      dataType: this.dataType ? this.dataType.id : '',
      allowNull: this.allowNull,
    };
  }
}
