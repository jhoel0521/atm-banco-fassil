// src/app/env.constants.ts

export const ENV = {
    URL_BANCO_FASSIL: process.env['URL_BANCO_FASSIL'] || 'http://localhost', // Puedes colocar un valor por defecto
    LOGIN: '/api/login',
    ME: '/api/me',
    ACCOUNTS: '/api/accounts',
    TRANSACTIONS: '/api/transactions',
    ACCOUNT_WITHDRAW: '/api/account/withdraw',
    LOGOUT: '/api/logout'
  };
  