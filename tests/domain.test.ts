import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accepts } from '../src/logic.ts';
test('quotients are exact and differences ignore order', () => {
 assert.equal(accepts({op:'/',target:2},[4,2]),true);
 assert.equal(accepts({op:'/',target:2},[3,2]),false);
 assert.equal(accepts({op:'-',target:3},[1,4]),true);
 assert.equal(accepts({op:'-',target:3},[4,1]),true);
});
