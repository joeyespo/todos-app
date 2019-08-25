/* global process */

import React from 'react';
import TodoApp from './components/TodoApp';

// Override these defaults in your local .env
const API_URL = process.env.API_URL || 'https://joeyespo-todos.herokuapp.com';
const STORAGE_KEY = process.env.STORAGE_KEY || 'TODOS';

export default function App() {
  console.debug('API_URL =', API_URL)
  return (
    <TodoApp storageKey={STORAGE_KEY} apiUrl={API_URL} />
  );
}
