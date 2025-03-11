import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ServicesProvider } from './hooks/useServices';
import { FirebaseProvider } from './contexts/FirebaseContext';
import { AppThemeProvider } from './contexts';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

// サービス層の初期化
import { initializeServices } from './application/services';
import { initializeFirebase } from './config/firebase';

// Firebaseの初期化
const { app, auth, firestore, storage, functions } = initializeFirebase();

// サービス層の初期化
const services = initializeServices({
  firestore,
  auth,
  functions,
  storage
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <FirebaseProvider
      app={app}
      auth={auth}
      firestore={firestore}
      storage={storage}
      functions={functions}
    >
      <ServicesProvider services={services}>
        <AppThemeProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AppThemeProvider>
      </ServicesProvider>
    </FirebaseProvider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 