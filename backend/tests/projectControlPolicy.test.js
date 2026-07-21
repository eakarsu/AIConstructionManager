'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { assertTransition, calculateForecast } = require('../domain/projectControlPolicy');
const { validateRuntime } = require('../config/runtime');

test('approval is role controlled', () => assert.throws(() => assertTransition('submitted', 'approved', 'worker'), /must approve/));
test('implemented work needs verification before terminal state', () => assert.doesNotThrow(() => assertTransition('implemented', 'verified', 'inspector')));
test('cost forecast is deterministic', () => assert.deepEqual(calculateForecast({ committed: 100, actual: 80, pendingChanges: 10, remainingEstimate: 20 }), { forecastAtCompletion: 110, committedExposure: 110 }));
test('runtime rejects weak signing secrets', () => assert.throws(() => validateRuntime({ JWT_SECRET: 'short', DB_NAME: 'test' }), /at least 32/));
