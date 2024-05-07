// Import necessary modules
import { group, check } from 'k6';
import { Trend } from 'k6/metrics';
import http from 'k6/http';

import urlencode from 'https://jslib.k6.io/form-urlencoded/3.0.0/index.js';
import { AuthResponse } from '../types/auth';

import { authUniversal, apikey } from '../auth';

export const options = {
  // define thresholds
  thresholds: {
    http_req_failed: [{ threshold: 'rate<0.01', abortOnFail: true }], // http errors should be less than 1%
    http_req_duration: ['p(99)<1000'], // 99% of requests should be below 1s
  },
  // define scenarios
  scenarios: {
    // arbitrary name of scenario
    average_load: {
      executor: 'ramping-vus',
      stages: [
        // ramp up to average load of X virtual users
        { duration: '5s', target: 1 },
        // maintain load
        { duration: '10s', target: 1 },
        // ramp down to zero
        { duration: '5s', target: 0 },
      ],
    },
  },
};

// Create custom trends
const loginLatency = new Trend('group_login_duration');
const createLatency = new Trend('group_create_emission_duration');

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
  group('MultiOS Unitary - Create Emission', function () {
    // console.warn('ENVIRONMENT', __ENV.ENVIRONMENT);

    // login flow
    const loginRes = http.post(
      authUniversal(__ENV.ENVIRONMENT).url,
      urlencode(authUniversal(__ENV.ENVIRONMENT).credentials),
      authUniversal(__ENV.ENVIRONMENT).params
    );
    loginLatency.add(loginRes.timings.duration);
    check(loginRes, {
      'login universal 200': (res) => res.status == 200,
    });

    // console.log(loginRes.body);
    const auth: AuthResponse = JSON.parse(String(loginRes.body));

    const createPayload = {
      socketId: '742376a0-24ff-4fb5-bf03-fb6a52203517',
      massiveUUID: '649f20162db3a4e6847b0d65',
      source: 'MASSIVE',
      billing: {
        legacyId: 'UPPERSPA.456410',
        currentAccount: '76433569-1-85',
      },
      origin: {
        _id: '6419c86bc20a12d2befd24ce',
        sender: 'Cristian AT',
        rut: '7841838-9',
        phone: '9861933293',
        email: 'cristian.alarcon@blue.cl',
        address: {
          formatted: 'Andrés Bello 1256, Temuco, Araucanía, Chile',
          country: 'Chile',
          zone: 'SUR',
          cityCode: 'ZCO',
          city: 'Cautín',
          stateNumber: 9,
          stateCode: 'CL-AR',
          state: 'Araucanía',
          communeNumber: 9101,
          communeCode: 'ZCO',
          commune: 'TEMUCO',
          street: 'Andrés Bello',
          streetNumber: 1256,
          deptoOrOffice: '101',
          reference: 'edificio esquina',
          location: {
            latitude: -38.7425889,
            longitude: -72.58462,
          },
        },
        userId: '63cff0cd29de303e5d449bd7',
      },
      packageDetails: {
        quantity: 1,
        sameSizeAndPrice: false,
        description: '123',
        weight: 60,
        volume: 0.003,
        volumetricWeight: 0.2505,
        packageCategory: 'cafeteria-products-liquids-food-articles',
        shippings: [
          {
            clientReference1: 'ref1',
            price: 23,
            size: {
              height: 10,
              length: 10,
              weight: 20,
              width: 10,
            },
          },
        ],
      },
      destiny: {
        _id: '642b255f786026f125dd0258',
        alias: 'ERICK  DOMICILIO BLUE',
        receiver: 'ERICK  DOMICILIO BLUE',
        phone: '986193329',
        email: 'ERICK@erick.cl',
        type: 'address',
        bluePoint: null,
        address: {
          formatted:
            'Río Malleco 9353, 8250308 Santiago, La Florida, Región Metropolitana, Chile',
          country: 'Chile',
          zone: 'SANTIAGO',
          cityCode: 'SCL',
          city: 'Santiago',
          stateNumber: 13,
          stateCode: 'CL-RM',
          state: 'Región Metropolitana',
          communeNumber: 13110,
          communeCode: 'LFD',
          commune: 'LA FLORIDA',
          street: 'Río Malleco',
          streetNumber: 9353,
          deptoOrOffice: '',
          reference: '',
          location: {
            latitude: -33.54267,
            longitude: -70.59317,
          },
        },
        userId: '63cff0cd29de303e5d449bd7',
      },
      serviceType: 'MD',
      complementaryServices: {
        extraWarranty: {
          active: false,
          invoiceNumber: '',
        },
        returnDocuments: {
          code: 'DD',
          active: false,
          documentType: '',
          documentNumber: '',
        },
        cashOnDelivery: {
          code: 'CD',
          active: false,
          paymentMethod: '',
          amount: 0,
        },
      },
      termsAndConditions: true,
    };

    // create emission flow
    const createRes = http.post(
      `${basePath}/api/integration/multios/emission/v1/emissions`,
      JSON.stringify(createPayload),
      {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${auth.access_token}`,
          apikey: apikey(__ENV.ENVIRONMENT),
        },
      }
    );
    // console.log(createRes.body);

    // console.log(createRes);
    createLatency.add(createRes.timings.duration);
    check(createRes, {
      'create emission 201': (res) => res.status == 201,
    });
  });
}
