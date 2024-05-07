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
const orderServiceResultLatency = new Trend('group_order_service_duration');

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

    const payloadOrderServiceResult = {
      operation: 'CREATE_ORDER_OPERATION',
      payload: {
        request: {
          nombreEmbarcador: 'cris prueb lunes tarde',
          bloqueado: 0,
          codigoPostalEmbarcador: '',
          docTributario: 16,
          direccionDestino: 'Austria, 2067',
          nombreDestinatario: 'cristian',
          cantidadPiezas: '1',
          valorDeclarado: '233',
          calleEmbarcador: 'Austria',
          extFonoDestino: '',
          codigoProducto: 'P',
          valorFlete: '2605',
          observacion: 'BALON',
          codigoPostalDestino: '',
          comunaEmbarcador: 'Providencia',
          comunaDestino: 'Providencia',
          pisoDestino: '',
          valorTarifa: '3100',
          direccionEmbarcador:
            'Austria 2067, Providencia, , Región Metropolitana de Santiago',
          fecha: '06-05-2024',
          tipoDocumento: '',
          tipoClaseTarifa: '',
          ciudadEmbarcador: 'Santiago',
          descripcionProducto: 'BALON',
          valorCod: '3100',
          numeroEmbarcador: '2067',
          rutDestinatario: '',
          tipoPago: 'CC',
          blockEmbarcador: '',
          fonoEmbarcador: '979858837',
          ciudadDestino: 'Santiago',
          rutEmbarcador: '18378335-1',
          numeroOS: '8013024331',
          extFonoEmbarcador: '',
          postaDestino: 'PRO',
          idUsuario: 'LON0O2EPRMZIG5Q',
          valorSeguro: '0',
          sucursalCliente: '',
          alto: '6',
          valorImpuesto: '495',
          departamentoDestino: '',
          blockDestino: '',
          agencia: '',
          servicioComplementario06: '',
          servicioComplementario05: '',
          idTransaccion: '100352779',
          prefijoFono: '569',
          servicioComplementario08: '',
          fonoDestino: '+56979858837',
          servicioComplementario07: '',
          prefijoFonoEmbarcador: '',
          ancho: '15',
          pisoEmbarcador: '',
          calleDestino: 'Austria',
          celular: '979858837',
          largo: '20',
          servicioComplementario02: '',
          servicioComplementario01: 'CD',
          email: 'cgonzalez447@gmail.com',
          servicioComplementario04: '',
          emailEmbarcador: 'cgonzalez447@gmail.com',
          servicioComplementario03: '',
          regionEmbarcador: 'Región Metropolitana de Santiago',
          postaOrigen: 'PRO',
          codigoTipoServicio: '72',
          tipoCliente: '85',
          caller: 'SUPERAPP',
          referencia06: '',
          codigoCliente: '18378335',
          referencia03: '',
          referencia02: '',
          pesoFisico: '0.5',
          referencia05: '',
          referencia04: '',
          tipoMedida: '',
          referencia01: '100352779',
          regionDestino: 'Región Metropolitana de Santiago',
        },
        response: {
          retryCount: 0,
          error: {
            codigo: 0,
            mensaje: 'OK',
          },
        },
        operation: 'CREATE_ORDER_OPERATION',
      },
      timestamp: '2024-05-01 17:11:54',
    };

    const orderServiceResultRes = http.post(
      `${basePath}/api/pyme2c/emissions/callback/order-service/result`,
      JSON.stringify(payloadOrderServiceResult),
      {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${auth.access_token}`,
          apikey: apikey(__ENV.ENVIRONMENT),
        },
      }
    );
    // console.log(orderServiceResultRes.body);

    // console.log(priceSharingRes);
    orderServiceResultLatency.add(orderServiceResultRes.timings.duration);
    check(orderServiceResultRes, {
      'POST order-service-result 200': (res) => res.status == 200,
    });
  });
}
