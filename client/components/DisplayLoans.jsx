import React from 'react';
import { useNavigate } from 'react-router-dom';
import { loader } from '../assets';
import LoanCard from './LoanCard';

const DisplayLoans = ({ title, isLoading, loans }) => {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="font-epilogue font-semibold text-[18px] text-white text-left">{title} ({loans.length})</h1>

      <div className="flex flex-wrap mt-[20px] gap-[26px]">
        {isLoading && (
          <img src={loader} alt="loader" className="w-[100px] h-[100px] object-contain" />
        )}

        {!isLoading && loans.length === 0 && (
          <p className="font-epilogue font-semibold text-[14px] leading-[30px] text-[#818183]">
            No loans found
          </p>
        )}

        {!isLoading && loans.length > 0 && loans.map((loan) => (
          <LoanCard 
            key={loan.id}
            loan={loan}
          />
        ))}
      </div>
    </div>
  );
};

export default DisplayLoans;