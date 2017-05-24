import uuid = require('uuid');
import { DefineSchema } from "./define-schema";

export type DefineObjectType = 'datatype'
                             | 'datatype(enum)'
                             | 'datatype(array)'
                             | 'datatype(struct)'
                             | 'validator'
                             | 'schema'
                             | 'property';

export interface DefineObjectJSON {
  __type: DefineObjectType;
  __id: string;
  name: string;
}

export abstract class DefineObject {
  readonly __type: DefineObjectType;
  readonly __id: string = uuid();
  constructor(public name: string = '') {}
  abstract toJSON(): DefineObjectJSON;
  toString(): string { return `${ this.__type }(${ this.__id })`; }
}
