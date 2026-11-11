import { BrowserRouter, Route, Routes } from 'react-router';
import type { SignInUseCase } from '@/application/use-cases/sign-in';
import DashboardPage from '@/presentation/pages/dashboard-page';
import LoginPage from '@/presentation/pages/login-page';

interface AppProps {
  signIn: SignInUseCase;
}

function App({ signIn }: AppProps) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/login" element={<LoginPage signIn={signIn} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
