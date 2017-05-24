import { DefineSchema } from './define-schema';
import { SchemaParser } from './schema-parser';
import { SchemaIOProgress } from './schema-exporter';
import { Observable } from 'rxjs/Observable';
import * as fs from 'fs';
import * as path from 'path';

export class SchemaImporter {

  private files: Map<string, any> = new Map();

  constructor() {}

  get(): DefineSchema {
    const files = [];
    this.files.forEach(file => files.push(file));
    return new SchemaParser(files).get();
  }

  load(dirpath: string): Observable<SchemaIOProgress> {
    dirpath = path.normalize(dirpath);
    const progress = { current: 0, total: 0 };
    
    return new Observable(subscriber => {

      readDir(dirpath)
      .then(filenames => {
        const filepaths = filenames.map(filename => path.join(dirpath, filename));
        const promises = filepaths.map(async filepath => {
          const file = await readFile(filepath);
          this.files.set(filepath, file);
          progress.current++;
          subscriber.next(progress);
        });
        return Promise.all(promises);
      })
      .then(() => subscriber.complete());
      
    });
  }

}

function readDir(dirpath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(dirpath, (err, filenames) => {
      if (err) {
        reject(err);
      } else {
        resolve(filenames);
      }
    })
  });
}

function readFile(filepath: string): Promise<any> {
  filepath = path.normalize(filepath);
  return new Promise((resolve, reject) => {
    const reader = fs.createReadStream(filepath);
    let result = '';
    reader.on('error', reject);
    reader.on('data', chunk => result += chunk);
    reader.on('close', () => resolve(result));
  });
}
