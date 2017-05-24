import { suite, test } from 'mocha-typescript';
import { expect } from 'chai';
import { DefineSchemaJSON } from "./define-schema";
import { SchemaParser } from "./schema-parser";

@suite('SchemaParser') class TestSuite {

  @test '(-)parse: should parse schema JSON' () {
    const files = [
      `
      {
        "__type": "validator",
        "__id": "fake-id-1",
        "name": "number-validator",
        "fn": "function (value) { return typeof value === \\"number\\" }",
        "errorMessage": "Type of {value} should be number"
      }
      `,
      `
      {
        "__type": "datatype",
        "__id": "fake-id-2",
        "name": "number-type",
        "validators": [{ "validator": "fake-id-1" }]
      }
      `,
      `
      {
        "__type": "schema",
        "__id": "fake-id-0",
        "name": "test-schema",
        "validators": ["fake-id-1"],
        "dataTypes": ["fake-id-2"]
      }
      `
    ]
    const parser = new SchemaParser(files);

    const schema = parser.get();
    expect(schema).to.be.ok;
    expect(schema.__id).to.equal('fake-id-0');
    expect(schema.name).to.equal('test-schema');
    expect(schema.validators.length).to.equal(1);
    expect(schema.dataTypes.length).to.equal(1);

    const validator = schema.findValidator('fake-id-1');
    expect(validator).to.be.ok;
    expect(validator.__id).to.equal('fake-id-1');
    expect(validator.name).to.equal('number-validator');
    
    const datatype = schema.findDataType('fake-id-2');
    expect(datatype).to.be.ok;
    expect(datatype.__id).to.equal('fake-id-2');
    expect(datatype.name).to.equal('number-type');
  }

}