import { BrowserRouter, Route, Routes } from 'react-router';
import DashboardPage from '@/presentation/pages/dashboard-page';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
