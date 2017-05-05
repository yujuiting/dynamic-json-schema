import { DefineDataType, DefineDataTypeJSON } from './define-data-type';
import { DefineProperty, DefinePropertyJSON, DefinePropertyOptions } from './define-property';
import { DefineValidator, DefineValidatorExecution } from './define-validator';
import { DefineSchema, runtimeSchema } from "./define-schema";
import { getMapKeys, getMapValues, mapToObject, mapKeyTransform } from './utilities';

export interface DefineStructJSON extends DefineDataTypeJSON {
  property: { [name: string]: DefinePropertyJSON };
}

export class DefineStruct extends DefineDataType {

  static parse(json: DefineStructJSON, schema: DefineSchema = runtimeSchema): DefineStruct {
    const structType = new DefineStruct();
    (<any>structType).id = json.id;
    structType.name = json.name;
    DefineDataType.parseValidators(json, schema)
                  .forEach(ve => structType.addValidator(ve));

    for (const key in json.property) {
      const prop = DefineProperty.parse(json.property[key], schema);
      structType.addProperty(key, prop);
    }
    return structType;
  }

  private property: Map<string, DefineProperty> = new Map();

  constructor(properties: { [propertyName: string]: DefineDataType|DefinePropertyOptions } = {}) {
    super();

    for (let propertyName in properties) {
      this.addProperty(propertyName, properties[propertyName]);
    }
  }

  addProperty(name: string, property: DefineProperty);
  addProperty(name: string, options: DefinePropertyOptions);
  addProperty(name: string, dataType: DefineDataType, options: DefinePropertyOptions);
  addProperty(name: string,
              dataTypeOrOptionsOrProperty: DefineDataType|DefinePropertyOptions|DefineProperty,
              options?: DefinePropertyOptions) {
    if (this.hasProperty(name)) {
      throw new Error(`Property name collision ${ name }`);
    }

    if (dataTypeOrOptionsOrProperty instanceof DefineProperty) {
      this.property.set(name, dataTypeOrOptionsOrProperty);
    } else {
      const prop = new DefineProperty(dataTypeOrOptionsOrProperty, options);
      prop.name = name;
      this.property.set(name, prop);
    }
  }

  removeProperty(name: string) {
    this.property.delete(name);
  }

  removeAllProperties() {
    this.property.clear();
  }

  hasProperty(name: string): boolean {
    return this.property.has(name);
  }

  getProperty(name: string): DefineProperty|undefined {
    return this.property.get(name);
  }

  getProperties(): DefineProperty[] {
    return getMapValues(this.property);
  }

  getPropertyNames(): string[] {
    return getMapKeys(this.property);
  }

  getRelevantDataTypes(): DefineDataType[] {
    const dataTypes = super.getRelevantDataTypes();
    this.getProperties()
        .map(prop => prop.dataType ? prop.dataType.getRelevantDataTypes() : [])
        .reduce((prev, curr) => prev.concat(curr))
        .forEach(dataType => dataTypes.push(dataType));
    return dataTypes;
  }

  test(value: any): Error[] {
    const errors = super.test(value);
    // do not continue test if already fail
    if (errors.length === 0) {
      this.property.forEach((property, name) =>
        property.test(value[name]).forEach(err => errors.push(err)));
    }
    return errors;
  }

  toJSON(): DefineStructJSON {
    const json = super.toJSON() as DefineStructJSON;
    json.__type = 'datatype(struct)';
    json.property = {};
    this.property.forEach((property, name) =>
      json.property[name] = property.toJSON());

    return json;
  }

}
