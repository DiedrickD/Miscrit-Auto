import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {settings} from '../lib/model.mjs';
const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
const helper=source.slice(0,source.indexOf('const $='));
test('native rating mapping covers F- through S+ with no invented E grade',()=>{
  const context=vm.createContext({});vm.runInContext(helper,context);
  for(const [value,grade]of [[6,'F-'],[7,'F'],[8,'F+'],[9,'D'],[10,'D+'],[11,'C'],[12,'C+'],[13,'B'],[14,'B+'],[15,'A'],[16,'A+'],[17,'S'],[18,'S+'],[0,'Any grade']])assert.equal(context.ratingLabel(value),grade);
  assert.equal(context.ratingLabel(3),'3/18','legacy numeric thresholds are preserved');
});

test('search pacing is bounded and defaults to eight seconds',()=>{
  const catalog={species:[]};assert.equal(settings({},catalog).searchIntervalSeconds,8);
  assert.equal(settings({searchIntervalSeconds:20},catalog).searchIntervalSeconds,20);
  for(const value of [0,2,121,3.5,'10'])assert.throws(()=>settings({searchIntervalSeconds:value},catalog));
});
