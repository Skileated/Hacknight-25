import React, { useState, useEffect } from 'react';
import { DisplayLoans } from '../components';
import LoanForm from '../components/LoanForm';
import { useStateContext } from '../context';

const Loans = () => {
  console.log("Rendering Loans component");
  const [isLoading, setIsLoading] = useState(false);
  const [loans, setLoans] = useState([]);
  const { address, getLoans } = useStateContext();

  const fetchLoans = async () => {
    console.log("Fetching loans...");
    setIsLoading(true);
    try {
      const data = await getLoans();
      console.log("Loans data:", data);
      setLoans(data);
    } catch (error) {
      console.error("Error fetching loans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Loans component mounted, address:", address);
    if (address) fetchLoans();
  }, [address]);

  return (
    <div className="flex flex-col gap-[30px]">
      <div className="flex flex-col gap-[30px]">
        <h1 className="font-epilogue font-semibold text-[18px] text-white text-left">Microfinance Platform</h1>

        <LoanForm />

        <DisplayLoans 
          title="All Loans"
          isLoading={isLoading}
          loans={loans}
        />
      </div>
    </div>
  );
};

export default Loans;