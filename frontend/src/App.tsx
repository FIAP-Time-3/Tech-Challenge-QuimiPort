import { BrowserRouter, Route, Routes } from 'react-router';
import ProtectedRoute from '@/modules/auth/components/ProtectedRoute';
import DashboardPage from '@/modules/dashboard/pages/DashboardPage';
import LoginPage from '@/modules/auth/pages/LoginPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute key="dashboard" requiresAuthentication>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <ProtectedRoute key="login" requiresAuthentication={false}>
              <LoginPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
