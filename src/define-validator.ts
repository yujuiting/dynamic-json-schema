import { DefineObject, DefineObjectJSON } from './define-object';
import { DefineSchema, runtimeSchema } from "./define-schema";

export class WeakValidator {
  constructor(public schema: DefineSchema, public id: string = '') {}
  get(): DefineValidator | undefined {
    return this.schema.findValidator(this.id);
  }
  isNull(): boolean { return this.id.length === 0; }
}

const interpolate: (text: string, args: object) => string = require('interpolate');

export interface DefineValidatorFn {
  (value: any, ...args): boolean;
}

export interface DefineValidatorJSON extends DefineObjectJSON {
  fn: string;
  errorMessage: string;
}

export interface DefineValidatorVariable {
  name: string;
  type: 'string' | 'number' | 'object' | 'any';
}

export class DefineValidator extends DefineObject {

  static parse(json: DefineValidatorJSON, schema: DefineSchema = runtimeSchema): DefineValidator {
    const validator = new DefineValidator(eval(`(${ json.fn })`), json.errorMessage);
    (<any>validator).id = json.id;
    validator.name = json.name;
    return validator;
  }

  schema: DefineSchema = runtimeSchema;

  requireParameters: DefineValidatorVariable[] = [];

  constructor(public fn: DefineValidatorFn,
              public errorMessage: string,
              public readonly isPure = true) {
    super();
    if (typeof fn !== 'function') {
      throw new Error('DefineValidator require a function.');
    }
    this.parseParameters();
    this.schema.addValidator(this);
  }

  use(args: any[] = []): DefineValidatorExecution {
    return new DefineValidatorExecution(new WeakValidator(this.schema, this.id), args);
  }

  parseParameters(): void {
    const es5test = /^(function\s+\S{0,}|function\s{0,})\((.{0,})\)\s{0,}\{(.|\n){0,}\}/;
    const es6test = /(\((.{0,})\)|[a-z\d]+)\s{0,}\=\>/;
    const fnstring = this.fn.toString();
    let match = es5test.exec(fnstring);
    let paramNames;

    if (match && match[2]) {
      paramNames = match[2].replace(/\s/g, '').split(',');
    } else {
      match = es6test.exec(fnstring);
    }
    if (match && match[2]) {
      // (...args) => {}
      paramNames = match[2].replace(/\s/g, '').split(',');
    } else if (match && match[1]) {
      // arg => {}
      paramNames = match[1].replace(/\s/g, '').split(',');
    }

    if (!paramNames) {
      return;
    }
    
    this.requireParameters = paramNames.map(name =>
      ({ name, type: 'any' } as DefineValidatorVariable));
  }

  checkArguments(args: any[]): boolean {
    if (args.length < this.requireParameters.length) {
      return false;
    }

    return this.requireParameters.every((variable, index) => {
      if (variable.type === 'any') {
        return args[index] !== void 0;
      } else {
        return typeof args[index] === variable.type;
      }
    });
  }

  createContext(args: any[]): Object {
    const context = {};
    this.requireParameters.forEach((variable, index) =>
      context[variable.name] = args[index]);
    return context;
  }

  /**
   * Return error if fail or catch.
   */
  test(...args: any[]): Error | null {
    if (!this.checkArguments(args)) {
      return new Error(`validator require arguments: ${
        this.requireParameters.map(variable => variable.name + ': ' + variable.type).join(', ')
      }`);
    }
    
    const context = this.createContext(args);
    context['value'] = args[0];
    context['args'] = args.slice(1);

    try {
      // catch fn execute
      if (this.fn.apply(context, args)) {
        return null;
      }
      let errorMessage = interpolate(this.errorMessage, context);
      return new Error(errorMessage);
    } catch (err) {
      if (err instanceof Error) {
        return err;
      }
      return new Error(toString.call(err));
    }
  }

  getWeakValidator(): WeakValidator {
    return new WeakValidator(this.schema, this.id);
  }

  toJSON(): DefineValidatorJSON {
    return {
      __type: 'validator',
      id: this.id,
      name: this.name,
      fn: this.fn.toString(),
      errorMessage: this.errorMessage
    };
  }

}

export class DefineValidatorExecution {
  constructor(public validator: WeakValidator, public args: any[] = []) {}
  test(value: any): Error | null {
    const validator = this.validator.get();
    if (validator) {
      return validator.test.apply(validator, [value].concat(this.args));
    } else {
      return new Error(`Validator (${ this.validator.id }) is missing`);
    }
  }
}
