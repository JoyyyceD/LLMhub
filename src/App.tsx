/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Leaderboard } from './pages/Leaderboard';
import { ModelDetail } from './pages/ModelDetail';
import { Community } from './pages/Community';
import { Comparison } from './pages/Comparison';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/compare" element={<Comparison />} />
          <Route path="/model/:id" element={<ModelDetail />} />
          <Route path="/community" element={<Community />} />
          <Route path="/about" element={<Home />} />
        </Routes>
      </Layout>
    </Router>
  );
}

