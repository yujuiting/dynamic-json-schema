import { suite, test } from 'mocha-typescript';
import { expect } from 'chai';
import { DefineEnum } from './define-enum';

@suite('DefineEnum') class DefineEnumTestSuite {

  enumType: DefineEnum;

  before() {
    this.enumType = new DefineEnum([
      { key: 'A', value: 0 },
      { key: 'B', value: 1 },
      { key: 'C', value: 2 }
    ]);
  }

  @test '(-)addOption: should add an option' () {
    this.enumType.addOption({ key: 'D', value: 3 });
    expect(this.enumType.options.length).to.equal(4);
  }

  @test '(-)removeOption: should remove an option' () {
    this.enumType.removeOption(this.enumType.options[0]);
    expect(this.enumType.options.length).to.equal(2);
  }

  @test '(-)resetOptions: should reset all options' () {
    this.enumType.resetOptions([
      { key: 'a', value: 0 },
      { key: 'b', value: 1 }
    ]);
    expect(this.enumType.options.length).to.equal(2);
  }

  @test '(-)test: should check enum type' () {
    expect(this.enumType.test(0).length).to.equal(0);
    expect(this.enumType.test(3).length).to.equal(1);
  }

}