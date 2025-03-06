import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../context';
import { calculateBarPercentage, daysLeft } from '../utils';
import { thirdweb } from '../assets';

const LoanCard = ({ loan }) => {
  const navigate = useNavigate();
  const { address, fundLoan, repayLoan } = useStateContext();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const remainingDays = loan.endTime > 0 ? 
    daysLeft(new Date(loan.endTime * 1000)) : 
    daysLeft(new Date(Date.now() + loan.duration * 1000));
  
  const isOwner = address === loan.borrower;
  const isActive = loan.status === 1; // Active status
  const isPending = loan.status === 0; // Pending status
  
  const handleFundLoan = async (e) => {
    e.stopPropagation();
    try {
      setIsLoading(true);
      await fundLoan(loan.id, amount);
      setAmount('');
    } catch (error) {
      console.error("Error funding loan:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRepayLoan = async (e) => {
    e.stopPropagation();
    try {
      setIsLoading(true);
      await repayLoan(loan.id, amount);
      setAmount('');
    } catch (error) {
      console.error("Error repaying loan:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStatusText = () => {
    switch(loan.status) {
      case 0: return 'Pending';
      case 1: return 'Active';
      case 2: return 'Repaid';
      case 3: return 'Defaulted';
      default: return 'Unknown';
    }
  };
  
  const getStatusColor = () => {
    switch(loan.status) {
      case 0: return 'text-[#ffaa00]';
      case 1: return 'text-[#1dc071]';
      case 2: return 'text-[#4acd8d]';
      case 3: return 'text-[#ff0000]';
      default: return 'text-[#808191]';
    }
  };

  return (
    <div className="sm:w-[288px] w-full rounded-[15px] bg-[#1c1c24] cursor-pointer" onClick={() => navigate(`/loan-details/${loan.id}`)}>
      <div className="flex flex-col p-4">
        <div className="flex flex-row items-center mb-[18px]">
          <img src={thirdweb} alt="user" className="w-[40px] h-[40px] rounded-full" />
          <div className="ml-[12px] flex-1">
            <h4 className="font-epilogue font-semibold text-[14px] text-white break-all">{loan.borrower}</h4>
            <p className="mt-[4px] font-epilogue font-normal text-[12px] text-[#808191]">Borrower</p>
          </div>
        </div>

        <div className="block">
          <h3 className="font-epilogue font-semibold text-[16px] text-white text-left leading-[26px] truncate">{loan.purpose}</h3>
          <p className="mt-[5px] font-epilogue font-normal text-[#808191] text-left leading-[18px] truncate">Amount: {loan.amount} ETH</p>
        </div>

        <div className="flex justify-between flex-wrap mt-[15px] gap-2">
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd] leading-[22px]">Interest Rate</h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate">{loan.interestRate / 100}%</p>
          </div>
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd] leading-[22px]">Duration</h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate">{loan.duration / (24 * 60 * 60)} days</p>
          </div>
        </div>

        <div className="flex items-center mt-[20px] gap-[12px]">
          <div className="w-full bg-[#3a3a43] rounded-full h-[5px]">
            <div className="bg-[#4acd8d] h-full rounded-full" style={{ width: `${calculateBarPercentage(loan.amount, loan.totalContributed)}%`, maxWidth: '100%' }}></div>
          </div>
          <p className="font-epilogue font-normal text-[12px] text-[#808191]">
            {loan.totalContributed} / {loan.amount} ETH
          </p>
        </div>

        <div className="flex items-center justify-between gap-[12px] mt-[12px]">
          <p className="font-epilogue font-normal text-[12px] text-[#808191]">
            {remainingDays > 0 ? `${remainingDays} days left` : 'Ended'}
          </p>
          <p className={`font-epilogue font-normal text-[12px] ${getStatusColor()}`}>
            {getStatusText()}
          </p>
        </div>

        {isPending && !isOwner && (
          <div className="mt-[20px] flex flex-col gap-[10px]">
            <input 
              type="number" 
              step="0.01"
              placeholder="Amount to fund (ETH)"
              className="py-[10px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[14px] placeholder:text-[#4b5264] rounded-[10px]"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="font-epilogue font-semibold text-[14px] leading-[22px] text-white min-h-[45px] px-4 rounded-[10px] bg-[#1dc071]"
              onClick={handleFundLoan}
              disabled={isLoading}
            >
              {isLoading ? 'Funding...' : 'Fund Loan'}
            </button>
          </div>
        )}

        {isActive && isOwner && (
          <div className="mt-[20px] flex flex-col gap-[10px]">
            <input 
              type="number" 
              step="0.01"
              placeholder="Amount to repay (ETH)"
              className="py-[10px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[14px] placeholder:text-[#4b5264] rounded-[10px]"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="font-epilogue font-semibold text-[14px] leading-[22px] text-white min-h-[45px] px-4 rounded-[10px] bg-[#1dc071]"
              onClick={handleRepayLoan}
              disabled={isLoading}
            >
              {isLoading ? 'Repaying...' : 'Repay Loan'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanCard;