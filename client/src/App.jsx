import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { Sidebar, Navbar } from './components';
import { CampaignDetails, CreateCampaign, Home, Profile } from './pages';
// Import Loans and LoanDetails directly if they're not in the pages index
import Loans from './pages/Loans';
import LoanDetails from './pages/LoanDetails';
import CreateLoan from './pages/CreateLoan';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary>
      <div className="relative sm:-8 p-4 bg-[#13131a] min-h-screen flex flex-row">
        <div className="sm:flex hidden mr-10 relative">
          <Sidebar />
        </div>

        <div className="flex-1 max-sm:w-full max-w-[1280px] mx-auto sm:pr-5">
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create-campaign" element={<CreateCampaign />} />
            <Route path="/campaign-details/:id" element={<CampaignDetails />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/loan-details/:id" element={<LoanDetails />} />
            <Route path="/create-loan" element={<CreateLoan />} />
          </Routes>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App;