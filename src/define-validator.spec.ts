import { suite, test } from 'mocha-typescript';
import { expect } from 'chai';
import { DefineValidator,
         DefineValidatorFn,
         DefineValidatorJSON } from './define-validator';

@suite('DefineValidator') class TestSuite {

  validator: DefineValidator;

  before() {
    this.validator = new DefineValidator(
      value => value !== 0,
      '{value} should not be 0.'
    );
  }

  @test '(-)toJSON: should return `DefineValidatorJSON`' () {
    const json = this.validator.toJSON();
    expect(json.errorMessage).to.equal('{value} should not be 0.');
    expect(json.fn).to.be.ok;
  }

  @test '(-)test: should return error if value is invalid' () {
    const error = this.validator.test(0);
    expect(error).to.be.instanceof(Error);
    expect((<Error>error).message).to.equal('0 should not be 0.');
  }

  @test '(-)parseParameters: should parse parameter of fn' () {
    const validator = new DefineValidator(
      (param1, param2, another) => true,
      ''
    );

    validator.parseParameters();

    expect(validator.requireParameters.length).to.equal(3);
    expect(validator.requireParameters[0].name).to.equal('param1');
    expect(validator.requireParameters[1].name).to.equal('param2');
    expect(validator.requireParameters[2].name).to.equal('another');
  }

  @test '(+)parse: should parse json' () {
    const json: DefineValidatorJSON = {
      __type: 'validator',
      id: 'fake-id',
      name: 'a_validator',
      fn: 'function (value) { return value === 0; }',
      errorMessage: '{value} should be 0.'
    };

    const validator = DefineValidator.parse(json);
    expect(validator.test(0)).to.be.null;
  }

}