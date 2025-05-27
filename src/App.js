// Importing necessary components
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import Main from './pages/Main';

import IDE from './pages/IDE';
import OSSimulation from './pages/OSSimulation';
import LandingPage from './pages/LandingPage';

/**
 * This is the main App component.
 * It sets up the routes for the application and the Toaster for notifications.
 * @return {JSX.Element} The App component.
 */
function App() {
  return (
    <div className="App">
      {/** displayes notifications */}
      <Toaster position="top-right" toastOptions={{
        success: {
            style: {
              background: '#425BAD',
              color: 'white',
            },
            iconTheme: {
              primary: 'white',
              secondary: '#425BAD',
              border: '2px solid white',
            },
          }, 
        error: {
          style: {
            background: '#ff4d4d',
            color: 'white',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#ff4d4d',
            border: '2px solid white',
          },
        },
      }}
      />
      <Router> {/** set up the routes */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/simulation" element={<Main />} />
          <Route path="/ide" element={<IDE />} />
          <Route path="/os-simulation" element={<OSSimulation />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
