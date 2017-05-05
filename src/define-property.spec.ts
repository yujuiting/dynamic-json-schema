import { suite, test } from 'mocha-typescript';
import { expect } from 'chai';
import { DefineProperty } from "./define-property";
import { DefineDataType } from "./define-data-type";
import { isNumber } from "./validators";

@suite('DefineProperty') class DefinePropertyTestSuite {

  requiredProperty: DefineProperty;

  optionalProperty: DefineProperty;

  before() {
    const number_t = new DefineDataType([isNumber]);
    this.requiredProperty = new DefineProperty(number_t);
    this.optionalProperty = new DefineProperty({
      dataType: number_t,
      allowNull: true
    });
  }

  @test '(-)constructor: should accept dataType or options' () {
    expect(this.requiredProperty).is.instanceof(DefineProperty);
    expect(this.optionalProperty).is.instanceof(DefineProperty);
  }

  @test '(-)test: if `allowNull` is disable, should return error' () {
    expect(this.requiredProperty.test(void 0).length).to.equal(1);
    expect(this.optionalProperty.test(void 0).length).to.equal(0);
  }

}