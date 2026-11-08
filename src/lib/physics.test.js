import { test } from 'node:test';
import assert from 'node:assert/strict';
import { averageSpeed, kmhToMs, projectile, shotOutcome } from './physics.js';
import { formatNumber } from './format.js';

const close = (a, b, eps = 0.01) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);

test('velocidad media: 100 m en 20 s = 5 m/s', () => {
  assert.equal(averageSpeed(100, 20), 5);
});

test('72 km/h = 20 m/s y en 15 s recorre 300 m', () => {
  close(kmhToMs(72), 20);
  close(kmhToMs(72) * 15, 300);
});

test('ida y vuelta: rapidez media 8 m/s, velocidad media 0', () => {
  assert.equal(averageSpeed(1200, 150), 8);
  assert.equal(averageSpeed(600 - 600, 150), 0);
});

test('tiro a 25 m/s y 25° cae a unos 48,9 m, antes del arco', () => {
  const p = projectile(25, 25);
  close(p.range, 48.86, 0.05);
  assert.equal(shotOutcome(25, 25).result, 'corto');
});

test('tiro a 25 m/s y 28° pasa bajo el travesaño (≈1,45 m)', () => {
  const o = shotOutcome(25, 28);
  assert.equal(o.result, 'gol');
  close(o.heightAtGoal, 1.45, 0.05);
});

test('ángulos complementarios dan el mismo alcance y 45° es el máximo', () => {
  close(projectile(20, 30).range, projectile(20, 60).range, 1e-9);
  assert.ok(projectile(20, 45).range > projectile(20, 44).range);
  assert.ok(projectile(20, 45).range > projectile(20, 46).range);
});

test('el balón vuelve al suelo al final del vuelo', () => {
  const p = projectile(22, 37);
  close(p.positionAt(p.timeOfFlight).y, 0, 1e-9);
});

test('formato con coma decimal', () => {
  assert.equal(formatNumber(48.857, 1), '48,9');
  assert.equal(formatNumber(1200, 0), '1.200');
});
