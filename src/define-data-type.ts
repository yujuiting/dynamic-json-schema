import { DefineObject, DefineObjectJSON } from './define-object';
import { DefineValidator, DefineValidatorExecution, WeakValidator } from './define-validator';
import { DefineSchema, runtimeSchema } from "./define-schema";
import { mapKeyTransform, mapToObject } from "./utilities";
import deepEqual = require('deep-equal');

export class WeakDataType {
  constructor(public schema: DefineSchema, public id: string = '') {}
  get(): DefineDataType | undefined {
    return this.schema.findDataType(this.id);
  }
  isNull(): boolean { return this.id.length === 0; }
}

export interface DefineDataTypeJSON extends DefineObjectJSON {
  validators: {

    // id of validator
    validator: string,

    // execute arguments
    args?: any[]

  }[];
}

export class DefineDataType extends DefineObject {

  static parse(json: DefineDataTypeJSON, schema: DefineSchema = runtimeSchema): DefineDataType {
    const dataType = new DefineDataType();
    (<any>dataType).id = json.id;
    dataType.name = json.name;
    DefineDataType.parseValidators(json, schema)
                  .forEach(ve => dataType.addValidator(ve));
    return dataType;
  }

  protected static parseValidators(json: DefineDataTypeJSON, schema: DefineSchema = runtimeSchema): DefineValidatorExecution[] {
    return json.validators.map(data => {
      const validator = new WeakValidator(schema, data.validator);
      if (validator) {
        return new DefineValidatorExecution(validator, data.args);
      } else {
        throw new Error(`Not found validator ${ data.validator }`);
      }
    });
  }

  schema: DefineSchema = runtimeSchema;

  validatorExecutions: DefineValidatorExecution[] = [];

  constructor(validators: Array<DefineValidator|DefineValidatorExecution> = []) {
    super();
    validators.forEach(validator => this.addValidator(validator));
    this.schema.addDataType(this, false);
  }

  addValidator(validator: DefineValidator|DefineValidatorExecution,
               ...args): void {
    let validatorExecution: DefineValidatorExecution;
    if (validator instanceof DefineValidator) {
      validatorExecution = validator.use(args);
    } else {
      validatorExecution = validator;
    }
    this.validatorExecutions.push(validatorExecution);
  }

  removeValidator(validator: DefineValidator|DefineValidatorExecution,
                  ...args): void {
    let validatorExecution: DefineValidatorExecution;
    if (validator instanceof DefineValidator) {
      validatorExecution = validator.use(args);
    } else {
      validatorExecution = validator;
    }

    let index = this.validatorExecutions.findIndex(item =>
      deepEqual(item, validatorExecution));
    
    if (index === -1) {
      return;
    }

    this.validatorExecutions.splice(index, 1);
  }

  getRelevantDataTypes(): DefineDataType[] {
    return [this];
  }

  getRelevantValidators(): DefineValidator[] {
    return this.getRelevantDataTypes()
               .map(dataType => {
                 return dataType.validatorExecutions
                  .filter(e => e.validator.get() !== undefined)
                  .map(e => e.validator.get() as DefineValidator);
               })
               .reduce((prev, curr) => prev.concat(curr));
  }

  test(value: any): Error[] {
    const errors: Error[] = [];
    this.validatorExecutions.forEach(validatorExecution => {
      const error = validatorExecution.test(value);
      if (error) {
        errors.push(error);
      }
    });
    return errors;
  }

  getWeakDataType(): WeakDataType {
    return new WeakDataType(this.schema, this.id);
  }

  toJSON(): DefineDataTypeJSON {
    const json: DefineDataTypeJSON = {
      __type: 'datatype',
      id: this.id,
      name: this.name,
      validators: this.validatorExecutions
      .filter(ve => {
        const v = ve.validator.get();
        // ignore missing or not pure validator
        return v ? v.isPure : false
      })
      .map(execution => ({
        validator: execution.validator.id,
        args: execution.args
      }))
    }
    return json;
  }

}
