export const apikey = (environment: string) =>
  `${
    environment === 'dev'
      ? 'rbXwHUVZPZuK6cj3VAYSVpnrC6ANnAUT'
      : environment === 'qa'
      ? '3OUZ13MY5pELxtFqZrpyw6CrGds88yCM'
      : environment === 'prod'
      ? 'EaIAdSFngNrcpLxOjRPRiaqzJ4nS4Rwg'
      : ''
  }`;

export const authUniversal = (environment: string) => ({
  url: `${
    environment === 'dev'
      ? 'https://desa.sso.bluex.cl/auth/realms/universal-app/protocol/openid-connect/token'
      : environment === 'qa'
      ? 'https://qa.sso.bluex.cl/auth/realms/universal-app/protocol/openid-connect/token'
      : environment === 'prod'
      ? 'https://sso.bluex.cl/auth/realms/universal-app/protocol/openid-connect/token'
      : 'http://localhost:3000/auth/realms/universal-app/protocol/openid-connect/token'
  }`,
  params: {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      apikey: apikey(environment),
    },
  },
  credentials: {
    grant_type: 'password',
    client_id: 'admin-cli',
    username: 'superapp.blue@gmail.com',
    password: 'SuperApp_Blue9',
  },
});

export const authSuperApp = (environment: string) => ({
  url: `${
    environment === 'dev'
      ? 'https://desa.sso.bluex.cl/auth/realms/super-app/protocol/openid-connect/token'
      : environment === 'qa'
      ? 'https://qa.sso.bluex.cl/auth/realms/super-app/protocol/openid-connect/token'
      : environment === 'prod'
      ? 'https://sso.bluex.cl/auth/realms/super-app/protocol/openid-connect/token'
      : 'http://localhost:3000/auth/realms/super-app/protocol/openid-connect/token'
  }`,
  params: {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      apikey: apikey(environment),
    },
  },
  credentials: {
    grant_type: 'password',
    client_id: 'bx-client',
    username: 'lavallejos@stefanini.com',
    password: '@Lafv1992',
    client_secret: '5900d406-1123-497b-8194-ce752832af6c',
  },
});
