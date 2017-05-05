import { suite, test } from 'mocha-typescript';
import { expect } from 'chai';
import { DefineDataType } from "./define-data-type";
import { DefineValidator } from "./define-validator";
import * as validators from "./validators";

const hasContainValidator = new DefineValidator(
  function (value: string) { return value.indexOf(this.contain) !== -1; },
  '{value} should contain {contain}'
);

@suite('DefineDataType') class TestSuite {

  dataType: DefineDataType;

  before() {
    this.dataType = new DefineDataType();
    this.dataType.addValidator(validators.isString);
  }

  @test '(-)addValidator: should add validator' () {
    const validator = new DefineValidator(value => true, 'never fail');

    expect(this.dataType.validatorExecutions.length).to.equal(1);
    this.dataType.addValidator(validator);
    expect(this.dataType.validatorExecutions.length).to.equal(2);
  }

  @test '(-)removeValidator: should remove validator' () {
    this.dataType.removeValidator(validators.isString);
    expect(this.dataType.validatorExecutions.length).to.equal(0);
  }

  @test '(-)getRelevantDataTypes: should contain self' () {
    const relevant = this.dataType.getRelevantDataTypes();
    expect(relevant.length).to.equal(1);
    expect(relevant[0]).to.equal(this.dataType);
  }

  @test '(-)getRelevantValidators: should return relevant validators' () {
    const relevant = this.dataType.getRelevantValidators();
    expect(relevant.length).to.equal(1);
    expect(relevant[0]).to.equal(validators.isString);
  }

}