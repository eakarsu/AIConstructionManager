'use strict';

const TRANSITIONS = Object.freeze({ draft: ['submitted'], submitted: ['approved', 'rejected'], rejected: ['draft'], approved: ['implemented'], implemented: ['verified'], verified: [] });

function assertTransition(from, to, role) {
  if (!(TRANSITIONS[from] || []).includes(to)) throw Object.assign(new Error(`Invalid transition from ${from} to ${to}`), { statusCode: 409 });
  if (['approved', 'rejected', 'verified'].includes(to) && !['manager', 'admin', 'inspector'].includes(role)) {
    throw Object.assign(new Error('A manager or inspector must approve this transition'), { statusCode: 403 });
  }
}

function calculateForecast({ committed = 0, actual = 0, pendingChanges = 0, remainingEstimate = 0 }) {
  const values = [committed, actual, pendingChanges, remainingEstimate].map(Number);
  if (values.some((v) => !Number.isFinite(v) || v < 0)) throw Object.assign(new Error('Cost inputs must be non-negative numbers'), { statusCode: 400 });
  return { forecastAtCompletion: values[1] + values[2] + values[3], committedExposure: values[0] + values[2] };
}

module.exports = { assertTransition, calculateForecast };
