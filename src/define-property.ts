import { DefineObject, DefineObjectJSON } from './define-object';
import { DefineDataType, WeakDataType } from './define-data-type';
import { DefineStruct } from './define-struct';
import { DefineSchema, runtimeSchema } from "./define-schema";

export interface DefinePropertyJSON extends DefineObjectJSON {
  dataType: string;
  allowNull?: boolean;
  initValue: any;
}

export interface DefinePropertyOptions {
  name?: string;
  dataType?: DefineDataType;
  allowNull?: boolean;
}

export class DefineProperty extends DefineObject {

  static parse(json: DefinePropertyJSON, schema: DefineSchema = runtimeSchema): DefineProperty {
    const dataType = new WeakDataType(schema, json.dataType);
    const prop = new DefineProperty(json.name, dataType, { allowNull: json.allowNull });
    (<any>prop).__id= json.__id;
    prop.name = json.name;
    prop.initValue = json.initValue;
    return prop;
  }

  schema: DefineSchema = runtimeSchema;
  
  allowNull = false;

  initValue: string;

  dataType: WeakDataType = new WeakDataType(this.schema);

  constructor(name: string,
              dataTypeOrOptions: DefineDataType|WeakDataType|DefinePropertyOptions,
              options: DefinePropertyOptions = {}) {
    super(name);
    (<any>this).__type = 'property';

    if (dataTypeOrOptions instanceof DefineDataType ||
        dataTypeOrOptions instanceof WeakDataType) {

      this.setDataType(dataTypeOrOptions);

    } else {

      if (dataTypeOrOptions.dataType !== void 0) {
        this.setDataType(dataTypeOrOptions.dataType);
      }
      
      options = {
        allowNull: dataTypeOrOptions.allowNull
      };

    }
    
    this.name = options.name !== void 0 ? options.name : this.name;
    this.allowNull = options.allowNull !== void 0 ? options.allowNull : this.allowNull;
  }

  getInitValue(): any {
    return eval(`(${ this.initValue })`);
  }


  setDataType(dataType: DefineDataType|WeakDataType) {
    if (dataType instanceof DefineDataType) {
      this.dataType = dataType.getWeakDataType();
    } else {
      this.dataType = dataType;
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

    const dataType = this.dataType.get();

    if (dataType) {
      errors = dataType.test(value);
    } else {
      errors = [new Error(`Missing datatype (${ this.dataType.id })`)];
    }
    
    return errors;
  }

  clone(): DefineProperty {
    return new DefineProperty(this.name, this.dataType, { allowNull: this.allowNull });
  }

  toJSON(): DefinePropertyJSON {
    return {
      __type: 'property',
      __id: this.__id,
      name: this.name,
      dataType: this.dataType ? this.dataType.id : '',
      allowNull: this.allowNull,
      initValue: this.initValue
    };
  }
}
