import { DefineValidator,
         DefineValidatorFn,
         DefineValidatorExecution } from './define-validator';

/**
 * 字串檢查長度
 */
export const maxStringLength: DefineValidator = new DefineValidator(
  'max-string-length',
  (value, length) => value.length <= length,
  `Length of {value} is longer than {length}.`,
  false
);

/**
 * 數字檢查大小
 */
export const maxValue: DefineValidator = new DefineValidator(
  'max-value',
  (value, max) => value <= max,
  `Value {value} is bigger than {max}.`,
  false
);

export const minValue: DefineValidator = new DefineValidator(
  'min-value',
  (value, min) => value >= min,
  `Value {value} is smaller than {min}.`,
  false
);

export const rangeValue: DefineValidator = new DefineValidator(
  'range-value',
  (value, min, max) => value >= min && value <= max,
  `Value {value} should in range [{min}, {max}].`,
  false
);

/**
 * 字串檢查
 */
export const isString: DefineValidator = new DefineValidator(
  'is-string',
  (value) => typeof value === 'string',
  'Value {value} is not a string.',
  false
);

/**
 * 數字檢查
 */
export const isNumber: DefineValidator = new DefineValidator(
  'is-number',
  (value) => typeof value === 'number',
  'Value {value} is not a number.',
  false
);

export const isObject: DefineValidator = new DefineValidator(
  'is-object',
  (value: any) => typeof value === 'object',
  'Value {value} should be an object.',
  false
);

export const isArray: DefineValidator = new DefineValidator(
  'is-array',
  (value) => Array.isArray(value),
  'Value {value} should be an array.',
  false
);

export const isBoolean: DefineValidator = new DefineValidator(
  'is-boolean',
  (value) => typeof value === 'boolean',
  'Value {value} should be a boolean.',
  false
);

export const isContainedIn = new DefineValidator(
  'is-contained-in',
  (value, list) => list.indexOf(value) !== -1,
  `Value {value} is not in {list}`,
  false
);

export const notNull = new DefineValidator(
  'not-null',
  (value) => value !== null,
  `Value {value} should not be null`,
  false
);
