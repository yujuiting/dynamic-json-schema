import { DefineObject, DefineObjectJSON } from "./define-object";
import { DefineDataType } from "./define-data-type";
import { DefineValidator } from "./define-validator";

export interface DefineSchemaJSON extends DefineObjectJSON {
  validators: string[];
  dataTypes: string[];
}

export class DefineSchema extends DefineObject {

  validators: DefineValidator[] = [];

  dataTypes: DefineDataType[] = [];

  constructor(name: string) {
    super();
    (<any>this).__type = 'schema';
    this.name = name;
  }

  addValidator(validator: DefineValidator) {
    if (validator.schema === this) {
      return
    } else if (validator.schema !== void 0) {
      validator.schema.removeValidator(validator);
    }

    validator.schema = this;

    if (this.validators.indexOf(validator) !== -1) {
      return;
    }
    this.validators.push(validator);
  }

  removeValidator(validator: DefineValidator) {
    const index = this.validators.indexOf(validator);
    if (index !== -1) {
      this.validators.splice(index, 1);
    }
  }

  addDataType(dataType: DefineDataType, checkRelevant = true) {
    if (dataType.schema === this) {
      return
    } else if (dataType.schema !== void 0) {
      dataType.schema.removeDataType(dataType);
    }

    dataType.schema = this;

    if (this.dataTypes.indexOf(dataType) !== -1) {
      return;
    }
    this.dataTypes.push(dataType);

    if (checkRelevant) {
      dataType.getRelevantValidators().forEach(validator => this.addValidator(validator));
      dataType.getRelevantDataTypes().forEach(relevantDataType => this.addDataType(relevantDataType));
    }
  }

  removeDataType(dataType: DefineDataType) {
    const index = this.dataTypes.indexOf(dataType);
    if (index !== -1) {
      this.dataTypes.splice(index, 1);
    }
  }

  findValidator(id: string): DefineValidator | undefined {
    return this.validators.find(validator => validator.__id === id);
  }

  findDataType(id: string): DefineDataType | undefined {
    return this.dataTypes.find(dataType => dataType.__id === id);
  }

  findValidatorByName(name: string): DefineValidator | undefined {
    return this.validators.find(validator => validator.name === name);
  }

  findDataTypeByName(name: string): DefineDataType | undefined {
    return this.dataTypes.find(dataType => dataType.name === name);
  }
  
  toJSON(): DefineSchemaJSON {
    return {
      __type: 'schema',
      __id: this.__id,
      name: this.name,
      validators: this.validators
        // .filter(validator => validator.isStatic)
        // .map(validator => validator.toJSON()),
        .map(validator => validator.__id),
      dataTypes: this.dataTypes
        // .map(dataType => dataType.toJSON())
        .map(dataType => dataType.__id)
    };
  }
}

/**
 * For built-in validator or data type.
 */
export const runtimeSchema = new DefineSchema('runtime schema');