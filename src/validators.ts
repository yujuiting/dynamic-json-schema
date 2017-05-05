import { DefineValidator,
         DefineValidatorFn,
         DefineValidatorExecution } from './define-validator';

/**
 * 字串檢查長度
 */
export const maxStringLength: DefineValidator = new DefineValidator(
  (value, length) => value.length <= length,
  `Length of {value} is longer than {length}.`
);

/**
 * 數字檢查大小
 */
export const maxValue: DefineValidator = new DefineValidator(
  (value, max) => value <= max,
  `Value {value} is bigger than {max}.`
);

export const minValue: DefineValidator = new DefineValidator(
  (value, min) => value >= min,
  `Value {value} is smaller than {min}.`
);

export const rangeValue: DefineValidator = new DefineValidator(
  (value, min, max) => value >= min && value <= max,
  `Value {value} should in range [{min}, {max}].`
);

/**
 * 字串檢查
 */
export const isString: DefineValidator = new DefineValidator(
  (value) => typeof value === 'string',
  'Value {value} is not a string.'
);

/**
 * 數字檢查
 */
export const isNumber: DefineValidator = new DefineValidator(
  (value) => typeof value === 'number',
  'Value {value} is not a number.'
);

export const isObject: DefineValidator = new DefineValidator(
  (value: any) => typeof value === 'object',
  'Value {value} should be an object.');

export const isArray: DefineValidator = new DefineValidator(
  (value) => Array.isArray(value),
  'Value {value} should be an array.'
);

export const isBoolean: DefineValidator = new DefineValidator(
  (value) => typeof value === 'boolean',
  'Value {value} should be a boolean.'
);
