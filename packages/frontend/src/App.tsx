import { ChatRoom } from './components/Chat/ChatRoom';
import { AuthPage } from './pages/AuthPage';
import { authService } from './services/authService';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Router>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatRoom />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default App;
