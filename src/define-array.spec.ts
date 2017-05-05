import { suite, test } from 'mocha-typescript';
import { expect } from 'chai';
import { DefineArray } from "./define-array";
import { DefineDataType } from "./define-data-type";
import { isNumber } from "./validators";

const numberType = new DefineDataType([isNumber]);

@suite('DefineArray') class DefineArrayTestSuite {
  arrayType: DefineArray;

  before() {
    this.arrayType = new DefineArray(numberType);
  }

  @test '(-)test: should test all item in array' () {
    const validArray = [1, 2, 3];
    expect(this.arrayType.test(validArray).length).to.equal(0);

    const invalidArray = ['a', 'b', 3];
    expect(this.arrayType.test(invalidArray).length).to.equal(2);

    const invalidValue = 123;
    expect(this.arrayType.test(invalidValue).length).to.equal(1);
  }

  @test '(-)getRelevantDataTypes: should contain data type of children' () {
    const relevant = this.arrayType.getRelevantDataTypes();
    expect(relevant.length).to.equal(2);
    expect(relevant).contain(this.arrayType);
    expect(relevant).contain(numberType);
  }
}
