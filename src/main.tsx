// import { StrictMode } from 'react';
// import { createRoot } from 'react-dom/client';
// import App from './App.tsx';
// import { AuthProvider } from './contexts/AuthContext';
// import './index.css';

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <AuthProvider>
//       <App />
//     </AuthProvider>
//   </StrictMode>
// );

// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css'; // 🔴 THIS IS THE IMPORTANT LINE
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './contexts/AuthContext';
// import { HomePage } from './pages/HomePage';
// import AdminLogin from './pages/AdminLogin';

// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <AuthProvider>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<HomePage />} />
//           <Route path="/admin" element={<AdminLogin />} />
//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   </React.StrictMode>
// );
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HomePage } from './pages/HomePage';
import AdminLogin from './pages/AdminLogin';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Default page → Admin Login */}
          <Route path="/" element={<AdminLogin />} />

          {/* Events page */}
          <Route path="/events" element={<HomePage />} />

          {/* Optional explicit admin route */}
          <Route path="/admin" element={<AdminLogin />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);

