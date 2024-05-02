export const authDev = {
  url: 'http://desa.sso.bluex.cl/auth/realms/universal-app/protocol/openid-connect/token',
  params: {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      apikey: 'rbXwHUVZPZuK6cj3VAYSVpnrC6ANnAUT',
    },
  },
  credentials: {
    grant_type: 'password',
    client_id: 'admin-cli',
    username: 'superapp.blue@gmail.com',
    password: 'SuperApp_Blue9',
  },
};
