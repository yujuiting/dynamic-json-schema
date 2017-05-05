import { suite, test } from 'mocha-typescript';
import { expect } from 'chai';
import {
  createSymbolFromString,
  getMapKeys,
  getMapValues,
  mapToArray,
  mapToObject,
  mapKeyTransform,
  mapValueTransform,
  mapTransform
} from './utilities'

const map = new Map<string, number>([['a', 1], ['b', 2]]);

@suite class CreateSymbolFromStringTestSuite {

  @test 'should create symbol' () {
    const s = createSymbolFromString('Symbol(foo)');
    expect(typeof s).to.equal('symbol');
    expect(s.toString()).to.equal('Symbol(foo)');
  }

  @test 'should throw if invalid format' () {
    expect(() => createSymbolFromString('bar')).to.throw('invalid symbol format');
  }

}

@suite class GetMapKeysTestSuite {
  @test 'should get map keys' () {
    const keys = getMapKeys(map);
    expect(keys).is.instanceof(Array);
    expect(keys[0]).to.equal('a');
    expect(keys[1]).to.equal('b');
  }
}

@suite class GetMapValuesTestSuite {
  @test 'should get map values' () {
    const values = getMapValues(map);
    expect(values).is.instanceof(Array);
    expect(values[0]).to.equal(1);
    expect(values[1]).to.equal(2);
  }
}

@suite class MapToArrayTestSuite {
  @test 'should get array of map' () {
    const array = mapToArray(map);
    expect(array).has.property('keys');
    expect(array).has.property('values');
    expect(array.keys).contains('a');
    expect(array.keys).contains('b');
    expect(array.values).contains(1);
    expect(array.values).contains(2);
  }
}

@suite class MapToObjectTestSuite {
  @test 'should get object of map' () {
    const object = mapToObject(map);
    expect(object).has.property('a', 1);
    expect(object).has.property('b', 2);
  }
}

@suite class MapKeyTransformTestSuite {
  @test 'should transform keys in map' () {
    const newMap = mapKeyTransform(map, (v, k) => '_' + k);
    expect(newMap.has('_a')).to.be.true;
    expect(newMap.has('_b')).to.be.true;
    expect(newMap.has('a')).to.be.false;
    expect(newMap.has('b')).to.be.false;
  }
}

@suite class MapValueTransformTestSuite {
  @test 'should transform values in map' () {
    const newMap = mapValueTransform(map, v => v * 2);
    expect(newMap.get('a')).to.equal(2);
    expect(newMap.get('b')).to.equal(4);
  }
}

@suite class MapTransformTestSuite {
  @test 'should transform keys and values in map' () {
    const newMap = mapTransform(map, (v, k) => ({ key: v, value: k }));
    expect(newMap.get(1)).to.equal('a');
    expect(newMap.get(2)).to.equal('b');
  }
}