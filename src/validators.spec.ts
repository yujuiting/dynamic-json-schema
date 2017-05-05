import { suite, test } from 'mocha-typescript';
import { expect } from 'chai';
import { maxStringLength,
         maxValue,
         minValue,
         isString,
         isNumber,
         isObject,
         isArray } from './validators';
import { DefineValidatorExecution } from './define-validator';

@suite('max-string-length-validator') class StringLengthValidatorTestSuite {
  validator: DefineValidatorExecution;
  constructor() { this.validator = maxStringLength.use([4]); }

  @test'should pass test' () {
    expect(this.validator.test('fuck')).not.to.be.instanceof(Error);
  }

  @test'should return error' () {
    expect(this.validator.test('fuckyou')).to.be.instanceof(Error);
  }
}

@suite('max-value-validator') class MaxValueValidatorTestSuite {
  validator: DefineValidatorExecution;
  constructor() { this.validator = maxValue.use([10]); }

  @test'should pass test' () {
    expect(this.validator.test(5)).not.to.be.instanceof(Error);
  }

  @test'should return error' () {
    expect(this.validator.test(12)).to.be.instanceof(Error);
  }
}

@suite('min-value-validator') class MinValueValidatorTestSuite {
  validator: DefineValidatorExecution;
  constructor() { this.validator = minValue.use([10]); }

  @test'should pass test' () {
    expect(this.validator.test(12)).not.to.be.instanceof(Error);
  }

  @test'should return error' () {
    expect(this.validator.test(5)).to.be.instanceof(Error);
  }
}

@suite('is-string-validator') class IsStringValidatorTestSuite {
  @test'should pass test' () {
    expect(isString.test('12')).not.to.be.instanceof(Error);
  }

  @test'should return error' () {
    expect(isString.test(5)).to.be.instanceof(Error);
  }
}

@suite('is-number-validator') class IsNumberValidatorTestSuite {
  @test'should pass test' () {
    expect(isNumber.test(12)).not.to.be.instanceof(Error);
  }

  @test'should return error' () {
    expect(isNumber.test('5')).to.be.instanceof(Error);
  }
}

@suite('is-object-validator') class IsObjectValidatorTestSuite {
  @test'should pass test' () {
    expect(isObject.test({})).not.to.be.instanceof(Error);
  }

  @test'should return error' () {
    expect(isObject.test('5')).to.be.instanceof(Error);
  }
}

@suite('is-array-validator') class IsArrayValidatorTestSuite {
  @test'should pass test' () {
    expect(isArray.test([])).not.to.be.instanceof(Error);
  }

  @test'should return error' () {
    expect(isArray.test({})).to.be.instanceof(Error);
    expect(isArray.test('{}')).to.be.instanceof(Error);
  }
}