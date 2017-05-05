import { DefineDataType, DefineDataTypeJSON } from './define-data-type';
import { DefineValidator, DefineValidatorExecution } from './define-validator';
import { DefineSchema, runtimeSchema } from './define-schema';
import { mapToObject, mapKeyTransform } from './utilities';

export interface DefineEnumJSON extends DefineDataTypeJSON {
  options: DefineEnumOption[];
}

export interface DefineEnumOption {
  key: string;
  value: number;
}

export class DefineEnum extends DefineDataType {

  static parse(json: DefineEnumJSON, schema: DefineSchema = runtimeSchema): DefineEnum {
    const dataType = new DefineEnum(json.options);
    (<any>dataType).id = json.id;
    dataType.name = json.name;
    DefineDataType.parseValidators(json, schema)
                  .forEach(ve => dataType.addValidator(ve));
    json.options.forEach(option => dataType.addOption(option.key, option.value));
    return dataType;
  }

  constructor(public readonly options: DefineEnumOption[] = []) {
    super([enumValidator(options)]);
  }

  addOption(key: string, value: number): this;
  addOption(option: DefineEnumOption): this;
  addOption(keyOrOption: string|DefineEnumOption, value?: number): this {
    let key: string;

    if (typeof keyOrOption === 'string') {
      key = keyOrOption;
    } else {
      key = keyOrOption.key;
      value = keyOrOption.value;
    }

    if (this.options.find(o => o.key === key)) {
      return this;
    }

    if (key && value) {
      this.options.push({ key, value });
    }

    return this;
  }

  removeOption(key: string): this;
  removeOption(option: DefineEnumOption): this;
  removeOption(keyOrOption: string|DefineEnumOption): this {
    let key = typeof keyOrOption === 'string' ? keyOrOption : keyOrOption.key;
    const index = this.options.findIndex(o => o.key === key);
    if (index !== -1) {
      this.options.splice(index, 1);
    }
    return this;
  }

  resetOptions(options: DefineEnumOption[]) {
    this.options.splice(0, this.options.length);
    options.forEach(option => this.options.push(option));
  }

  toJSON(): DefineEnumJSON {
    const json = super.toJSON() as DefineEnumJSON;
    json.__type = 'datatype(enum)';
    json.options = this.options;
    return json;
  }
}

export function enumValidator(options: DefineEnumOption[]): DefineValidator {

  return new DefineValidator(
    function test(value: any): boolean {
      return options.some(o => o.value === value);
    },
    `Value {value} is not in [${ options.map(o => `${ o.key } = ${ o.value }`).join(', ') }]`,
    false
  );
}
