import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import Header from './components/Header'; // Component sẽ tạo ở Bước 8

// Component này dùng để bảo vệ route, nếu chưa login, đá về trang login
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Header /> {/* Header luôn hiển thị */}
      <main>
        <Routes>
          {/* Trang chủ: Yêu cầu đăng nhập */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Nếu đã đăng nhập, vào /login sẽ bị đá về trang chủ */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} 
          />
          
          {/* Nếu đã đăng nhập, vào /signup sẽ bị đá về trang chủ */}
          <Route 
            path="/signup" 
            element={isAuthenticated ? <Navigate to="/" /> : <SignupPage />} 
          />
        </Routes>
      </main>
    </>
  );
}

export default App;