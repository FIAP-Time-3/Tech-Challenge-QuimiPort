import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SignInUseCase } from '@/application/use-cases/sign-in';
import { FakeAuthenticationRepository } from '@/infrastructure/repositories/fake-authentication-repository';
import './index.css';
import App from './App';

const signIn = new SignInUseCase(new FakeAuthenticationRepository());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App signIn={signIn} />
  </StrictMode>,
);
