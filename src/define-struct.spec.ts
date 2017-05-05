import { suite, test } from 'mocha-typescript';
import { expect } from 'chai';
import { DefineStruct } from './define-struct';
import { DefineDataType } from "./define-data-type";
import { isNumber, isString } from "./validators";

const numberType = new DefineDataType([isNumber]);
const stringType = new DefineDataType([isString]);

@suite('DefineStruct') class DefineStructTestSuite {
  structType: DefineStruct;

  before() {
    this.structType = new DefineStruct({
      prop1: numberType,
      prop2: stringType
    });
  }

  @test '(-)test: should test all item in array' () {
    const validObj = { prop1: 123, prop2: '123' };
    expect(this.structType.test(validObj).length).to.equal(0);

    const invalidObj = { prop1: '123', prop2: 123 };
    expect(this.structType.test(invalidObj).length).not.to.equal(0);

    const invalidValue = 123;
    expect(this.structType.test(invalidValue).length).not.to.equal(0);
  }

  @test '(-)getRelevantDataTypes: should contain data type of children' () {
    const relevant = this.structType.getRelevantDataTypes();
    expect(relevant.length).to.equal(3);
    expect(relevant).contain(this.structType);
    expect(relevant).contain(numberType);
    expect(relevant).contain(stringType);
  }
}
