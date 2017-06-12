import { DefineDataType, DefineDataTypeJSON } from './define-data-type';
import { DefineProperty, DefinePropertyJSON, DefinePropertyOptions } from './define-property';
import { DefineValidator, DefineValidatorExecution } from './define-validator';
import { DefineSchema, runtimeSchema } from "./define-schema";
import { getMapKeys, getMapValues, mapToObject, mapKeyTransform } from './utilities';
import { isObject, notNull } from './validators';

export interface DefineStructJSON extends DefineDataTypeJSON {
  properties: DefinePropertyJSON[];
}

export interface DefinePropertyMap {
  [name: string]: DefineDataType|DefinePropertyOptions
}

export class DefineStruct extends DefineDataType {

  static parse(json: DefineStructJSON, schema: DefineSchema = runtimeSchema): DefineStruct {
    const structType = new DefineStruct(json.name);
    (<any>structType).__id= json.__id;
    structType.name = json.name;
    DefineDataType.parseValidators(json, schema)
                  .forEach(ve => structType.addValidator(ve));

    json.properties.forEach(propertyJson => {
      const prop = DefineProperty.parse(propertyJson, schema);
      structType.addProperty(prop);
    });
    DefineDataType.parseDataFromJSON(json, structType);
    return structType;
  }

  properties: DefineProperty[] = [];

  constructor(name: string, properties?: DefinePropertyMap | DefineProperty[]) {
    super(name, [isObject]);
    (<any>this).__type = 'datatype(struct)';

    if (Array.isArray(properties)) {
      properties.forEach(property => this.addProperty(property));
    } else if (properties) {
      for (let propertyName in properties) {
        const dataTypeOrOptions = properties[propertyName];
        if (dataTypeOrOptions instanceof DefineDataType) {
          this.addProperty(dataTypeOrOptions, { name: propertyName });
        } else {
          this.addProperty(dataTypeOrOptions);
        }        
      }
    }
  }

  addProperty(property: DefineProperty);
  addProperty(options: DefinePropertyOptions);
  addProperty(dataType: DefineDataType, options: DefinePropertyOptions);
  addProperty(dataTypeOrOptionsOrProperty: DefineDataType|DefinePropertyOptions|DefineProperty,
              options?: DefinePropertyOptions) {

    let property: DefineProperty;

    if (dataTypeOrOptionsOrProperty instanceof DefineProperty) {
      property = dataTypeOrOptionsOrProperty;
    } else {
      property = new DefineProperty(dataTypeOrOptionsOrProperty.name, dataTypeOrOptionsOrProperty, options);
    }

    if (this.hasProperty(property.name)) {
      throw new Error(`Property name collision ${ property.name }`);
    }

    this.properties.push(property);
  }

  removeProperty(name: string) {
    const index = this.properties.findIndex(property => property.name === name);
    if (index !== -1) {
      this.properties.splice(index, 1);
    }
  }

  hasProperty(name: string): boolean {
    return this.properties.findIndex(property => property.name === name) !== -1;
  }

  findProperty(name: string): DefineProperty|undefined {
    return this.properties.find(property => property.name === name);
  }

  getRelevantDataTypes(): DefineDataType[] {
    const dataTypes = super.getRelevantDataTypes();
    this.properties
        .map(property => {
          const dataType = property.dataType.get();
          if (!dataType) {
            return []
          }
          return dataType.getRelevantDataTypes();
        })
        .reduce((prev, curr) => prev.concat(curr), [])
        .forEach(dataType => dataTypes.push(dataType));
    return dataTypes;
  }

  test(value: any): Error[] {
    const errors = super.test(value);
    // do not continue test if already fail
    if (errors.length === 0) {
      this.properties.forEach(property => {
        const propertyErrors = property.test(value[property.name]);
        propertyErrors.forEach(e => errors.push(e));
      });
    }
    return errors;
  }

  toJSON(): DefineStructJSON {
    const json = super.toJSON() as DefineStructJSON;
    json.__type = 'datatype(struct)';
    json.properties = this.properties.map(property => property.toJSON());
    return json;
  }

}
