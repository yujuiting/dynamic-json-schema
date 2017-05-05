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
  id: string;
  name: string;
}

export abstract class DefineObject {
  readonly id: string = uuid();
  name: string = '';
  constructor() {}
  abstract toJSON(): DefineObjectJSON;
}
