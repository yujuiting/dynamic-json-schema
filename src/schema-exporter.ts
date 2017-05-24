import { DefineDataType } from './define-data-type';
import { DefineValidator } from './define-validator';
import { DefineSchema } from './define-schema';
import { DefineObject } from './define-object';
import { Observable } from 'rxjs/Observable';
import * as fs from 'fs';
import * as path from 'path';

export interface FileDescription {
  content: any;
  filename: string;
  filepath: string;
}

export interface SchemaIOProgress {
  total: number;
  current: number;
}

export class SchemaExporter {

  private target: DefineSchema;

  private files: FileDescription[] = [];

  private outDir: string;

  constructor(target?: DefineSchema) {
    this.target = target;
  }

  export(): FileDescription[] {
    this.files = [];

    if (!this.target) {
      return this.files;
    }

    this.files.push(this.createFile(this.target));

    this.target.validators.filter(validator => validator.isStatic).forEach(validator =>
    // this.target.validators.forEach(validator =>
      this.files.push(this.createFile(validator)));

    this.target.dataTypes.forEach(dataType =>
      this.files.push(this.createFile(dataType)));

    return this.files;
  }

  save(outDir?: string): Observable<SchemaIOProgress> {
    this.outDir = outDir || this.outDir;
    if (!this.outDir) {
      return Observable.throw('missing outDir');
    }

    this.export();

    const progress = { current: 0, total: this.files.length };

    return new Observable(subscriber => {
      ensureDirectoryExist(this.outDir)
        .then(() => Promise.all(this.files.map(async file => {
          await writeFile(file.filepath, file.content).catch(err => subscriber.error(err));
          progress.current++;
          subscriber.next(progress);
        })))
        .then(() => subscriber.complete())
        .catch(err => subscriber.error(err));
    });
  }

  private createFile(object: DefineObject): FileDescription {
    let extension;

    if (object instanceof DefineValidator) {
      extension = 'validator';
    } else if (object instanceof DefineDataType) {
      extension = 'datatype';
    } else if (object instanceof DefineSchema) {
      extension = 'schema';
    } else {
      extension = 'json';
    }

    const filename = `${ object.name || object.__id }.${ extension }`;
    return {
      content: JSON.stringify(object.toJSON(), null, '\t'),
      filename,
      filepath: path.join(this.outDir, filename)
    };
  }

}

function writeFile(filepath: string, data: any): Promise<void> {
  filepath = path.normalize(filepath);
  return new Promise<void>((resolve, reject) => {
    const writer = fs.createWriteStream(filepath);
    writer.on('close', resolve);
    writer.on('error', reject);
    writer.write(data);
  });
}

function ensureDirectoryExist(dirpath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {

    fs.readdir(dirpath, err => {
      if (err) {
        makeDirectory(dirpath).then(resolve).catch(reject);
      } else {
        resolve();
      }
    });

  });
}

function makeDirectory(dirpath: string): Promise<void> {
  return new Promise<void>((resolve, reject) =>
    fs.mkdir(dirpath, err => err ? reject(err) : resolve()));
}