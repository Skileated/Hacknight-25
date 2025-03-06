import React, { useState, useEffect } from 'react';
import { useStateContext } from '../context';
import { Loader, CustomButton } from '../components';
import { useNavigate } from 'react-router-dom';

const Loans = () => {
  console.log("Rendering Loans component");
  const [isLoading, setIsLoading] = useState(false);
  const [loans, setLoans] = useState([]);
  const { address, getLoans } = useStateContext();
  const navigate = useNavigate();

  const fetchLoans = async () => {
    if (!address) return;
    
    console.log("Fetching loans...");
    setIsLoading(true);
    try {
      const data = await getLoans();
      console.log("Loans data:", data);
      setLoans(data || []);
    } catch (error) {
      console.error("Error fetching loans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Loans component mounted, address:", address);
    fetchLoans();
  }, [address]);

  const handleCreateLoan = () => {
    navigate('/create-loan');
  };

  return (
    <div className="bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
      <div className="flex justify-between items-center w-full p-[16px] sm:min-w-[380px] bg-[#3a3a43] rounded-[10px]">
        <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white">Microfinance Platform</h1>
        <CustomButton 
          btnType="button"
          title="Create Loan"
          styles="bg-[#1dc071]"
          handleClick={handleCreateLoan}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center mt-[20px]">
          <Loader />
        </div>
      ) : (
        <div className="mt-[20px] w-full">
          {loans && loans.length > 0 ? (
            <div className="flex flex-wrap gap-[26px]">
              {loans.map((loan) => (
                <div 
                  key={loan.id}
                  className="sm:w-[288px] w-full rounded-[15px] bg-[#1c1c24] cursor-pointer p-4"
                  onClick={() => navigate(`/loan-details/${loan.id}`)}
                >
                  <div className="flex flex-col">
                    <h3 className="font-epilogue font-semibold text-[16px] text-white text-left leading-[26px] truncate">
                      {loan.purpose}
                    </h3>
                    <p className="mt-[5px] font-epilogue font-normal text-[#808191] text-left leading-[18px] truncate">
                      Amount: {loan.amount} ETH
                    </p>
                    <div className="flex justify-between mt-[15px]">
                      <p className="font-epilogue font-normal text-[12px] text-[#808191]">
                        Interest: {loan.interestRate / 100}%
                      </p>
                      <p className="font-epilogue font-normal text-[12px] text-[#808191]">
                        Status: {['Pending', 'Active', 'Repaid', 'Defaulted'][loan.status]}
                      </p>
                    </div>
                    <div className="flex items-center mt-[20px] gap-[12px]">
                      <div className="w-[30px] h-[30px] rounded-full flex justify-center items-center bg-[#13131a]">
                        <img src="/assets/thirdweb.png" alt="user" className="w-1/2 h-1/2 object-contain" />
                      </div>
                      <p className="flex-1 font-epilogue font-normal text-[12px] text-[#808191] truncate">
                        by <span className="text-[#b2b3bd]">{loan.borrower.slice(0, 6)}...{loan.borrower.slice(-4)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center mt-[20px]">
              <p className="font-epilogue font-bold text-[18px] text-white text-center">
                No loans found
              </p>
              <p className="font-epilogue font-normal text-[14px] text-[#808191] text-center mt-[10px]">
                {address ? "Create a new loan or check back later" : "Connect your wallet to view loans"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Loans;