import { DefineObject, DefineObjectJSON } from "./define-object";
import { DefineDataType, DefineDataTypeJSON } from "./define-data-type";
import { DefineValidator, DefineValidatorJSON } from "./define-validator";

export interface DefineSchemaJSON extends DefineObjectJSON {
  validators: DefineValidatorJSON[];
  dataTypes: DefineDataTypeJSON[];
}

export class DefineSchema extends DefineObject {

  validators: DefineValidator[] = [];

  dataTypes: DefineDataType[] = [];

  constructor(name: string) {
    super();
    this.name = name;
  }

  addValidator(validator: DefineValidator) {
    if (this.validators.indexOf(validator) !== -1) {
      return;
    }
    this.validators.push(validator);
  }

  addDataType(dataType: DefineDataType, checkRelevant = true) {
    if (this.dataTypes.indexOf(dataType) !== -1) {
      return;
    }
    this.dataTypes.push(dataType);

    if (checkRelevant) {
      dataType.getRelevantValidators().forEach(validator => this.addValidator(validator));
      dataType.getRelevantDataTypes().forEach(relevantDataType => this.addDataType(relevantDataType));
    }
  }

  findValidator(id: string): DefineValidator | undefined {
    return this.validators.find(validator => validator.id === id);
  }

  findDataType(id: string): DefineDataType | undefined {
    return this.dataTypes.find(dataType => dataType.id === id);
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
      id: this.id,
      name: this.name,
      validators: this.validators
                      .filter(validator => validator.isPure)
                      .map(validator => validator.toJSON()),
      dataTypes: this.dataTypes.map(dataType => dataType.toJSON())
    };
  }
}

/**
 * For built-in validator or data type.
 */
export const runtimeSchema = new DefineSchema('runtime schema');