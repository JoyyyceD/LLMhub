/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Leaderboard } from './pages/Leaderboard';
import { ModelDetail } from './pages/ModelDetail';
import { Community } from './pages/Community';
import { Comparison } from './pages/Comparison';
import { About } from './pages/About';
import { AboutMethodology } from './pages/AboutMethodology';
import { AboutDataSources } from './pages/AboutDataSources';
import { AboutIntelligenceBenchmarkingDoc } from './pages/AboutIntelligenceBenchmarkingDoc';
import { Resources } from './pages/Resources';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProviderDetail } from './pages/ProviderDetail';
import { ReviewNew } from './pages/ReviewNew';
import { Account } from './pages/Account';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/compare" element={<Comparison />} />
            <Route path="/model/:id" element={<ModelDetail />} />
            <Route path="/community" element={<Community />} />
            <Route path="/about" element={<About />} />
            <Route path="/about/methodology" element={<AboutMethodology />} />
            <Route path="/about/data-sources" element={<AboutDataSources />} />
            <Route path="/about/data-sources/intelligence-benchmarking" element={<AboutIntelligenceBenchmarkingDoc />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/provider/:name" element={<ProviderDetail />} />
            <Route path="/review/new" element={<ReviewNew />} />
            <Route path="/account" element={<Account />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
