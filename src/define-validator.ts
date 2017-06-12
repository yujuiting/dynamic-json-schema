import { DefineObject, DefineObjectJSON } from './define-object';
import { DefineSchema, runtimeSchema } from "./define-schema";

export class WeakValidator {

  constructor(public schema: DefineSchema, public id: string = '') {}

  get(): DefineValidator | undefined {
    return this.schema.findValidator(this.id);
  }

  isNull(): boolean { return this.id.length === 0; }

  clone(): WeakValidator {
    return new WeakValidator(this.schema, this.id);
  }
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

  static parse(json: DefineValidatorJSON): DefineValidator {
    const validator = new DefineValidator(json.name, eval(`(${ json.fn })`), json.errorMessage);
    (<any>validator).__id= json.__id;
    validator.name = json.name;
    return validator;
  }

  schema: DefineSchema;

  requireParameters: DefineValidatorVariable[] = [];

  constructor(name: string,
              public fn: DefineValidatorFn,
              public errorMessage: string,
              /**
               * static validator will be export
               * dynamic validator will be created in runtime
               */
              public readonly isStatic = true,
              /**
               * built in validator nor export and do not be record by data-type
               */
              public readonly isBuiltIn = false) {
    super(name);
    (<any>this).__type = 'validator';
    
    if (typeof fn !== 'function') {
      throw new Error('DefineValidator require a function.');
    }
    this.parseParameters();
    runtimeSchema.addValidator(this);

    if (!isStatic && name.length === 0) {
      throw new Error('non-static validator require an unique name');
    }

    if (!isStatic) {
      (<any>this).__id = `#${ name }`;
    }
  }

  use(...args: any[]): DefineValidatorExecution {
    return new DefineValidatorExecution(new WeakValidator(this.schema, this.__id), args);
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
    
    this.requireParameters = paramNames
      .filter(name => name !== 'value')
      .map(name => ({ name, type: 'any' } as DefineValidatorVariable));
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
  test(value, ...args: any[]): Error | null {
    if (!this.checkArguments(args)) {
      return new Error(`validator require arguments: ${
        this.requireParameters.map(variable => variable.name + ': ' + variable.type).join(', ')
      }`);
    }
    
    const context = this.createContext(args);
    context['value'] = value;
    context['args'] = args;

    try {
      // catch fn execute
      if (this.fn.apply(context, arguments)) {
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
    return new WeakValidator(this.schema, this.__id);
  }

  toJSON(): DefineValidatorJSON {
    return {
      __type: 'validator',
      __id: this.__id,
      name: this.name,
      fn: this.fn.toString(),
      errorMessage: this.errorMessage
    };
  }

}

export class DefineValidatorExecution {

  constructor(public validator: WeakValidator,
              public args: any[] = []) {}

  test(value: any): Error | null {
    const validator = this.validator.get();
    if (validator) {
      return validator.test.apply(validator, [value].concat(this.args));
    } else {
      return new Error(`Validator (${ this.validator.id }) is missing`);
    }
  }

  clone(): DefineValidatorExecution {
    return new DefineValidatorExecution(
      this.validator,
      this.args.slice(0));
  }
}
