// Import necessary modules
import { group, check } from 'k6';
import { Trend } from 'k6/metrics';
import http from 'k6/http';

import urlencode from 'https://jslib.k6.io/form-urlencoded/3.0.0/index.js';
import { AuthResponse } from '../types/auth';

import { authSuperApp, apikey } from '../auth';

export const options = {
  // define thresholds
  thresholds: {
    http_req_failed: [{ threshold: 'rate<0.01', abortOnFail: true }], // http errors should be less than 1%
    // http_req_duration: ['p(95)<1000'], // 99% of requests should be below 1s
  },
  // define scenarios
  scenarios: {
    // arbitrary name of scenario
    average_load: {
      executor: 'ramping-vus',
      stages: [
        // ramp up to average load of X virtual users
        { duration: '10s', target: 20 },
        // maintain load
        { duration: '60s', target: 20 },
        // ramp down to zero
        { duration: '10s', target: 0 },
      ],
    },
  },
};

// Create custom trends
const loginLatency = new Trend('group_login_duration');
const priceSharingLatency = new Trend('group_price_sharing_duration');

const basePath = `${
  __ENV.ENVIRONMENT === 'dev'
    ? 'https://devapigw.bluex.cl'
    : __ENV.ENVIRONMENT === 'qa'
    ? 'https://qaapigw.bluex.cl'
    : __ENV.ENVIRONMENT === 'prod'
    ? 'https://apigw.bluex.cl'
    : 'http://localhost:3000'
}`;

export default function () {
  group('SuperApp - MKT Flow', function () {
    // console.warn('ENVIRONMENT', __ENV.ENVIRONMENT);

    // login flow
    const loginRes = http.post(
      authSuperApp(__ENV.ENVIRONMENT).url,
      urlencode(authSuperApp(__ENV.ENVIRONMENT).credentials),
      authSuperApp(__ENV.ENVIRONMENT).params
    );
    loginLatency.add(loginRes.timings.duration);
    check(loginRes, {
      'POST token superapp 200': (res) => res.status == 200,
    });

    // console.log(loginRes.body);
    const auth: AuthResponse = JSON.parse(String(loginRes.body));

    const payloadPriceSharing = {
      EMAILS: ['cristian.alarcon@blue.cl'],
      PYME: 'pyme spa',
      DATE: '06-05-2024',
      ORIGIN: 'SCL',
      DESTINY: 'SCL',
      SIZE: 'XS',
      WEIGHT: 1,
      DAYS: 1,
      HOURS: 1,
      HEIGHT: 1,
      LENGTH: 1,
      WIDTH: 1,
      PRICE: 1000,
    };

    const priceSharingRes = http.post(
      `${basePath}/api/pyme2c/backend/v1/price-sharing`,
      JSON.stringify(payloadPriceSharing),
      {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${auth.access_token}`,
          apikey: apikey(__ENV.ENVIRONMENT),
        },
      }
    );
    // console.log(priceSharingRes.body);

    // console.log(priceSharingRes);
    priceSharingLatency.add(priceSharingRes.timings.duration);
    check(priceSharingRes, {
      'POST price-sharing 200': (res) => res.status == 200,
    });
  });
}
