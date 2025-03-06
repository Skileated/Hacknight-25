import React, { useState } from 'react';
import { useStateContext } from '../context';

const LoanForm = () => {
  const { createLoan } = useStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    purpose: '',
    amount: '',
    interestRate: '',
    duration: ''
  });

  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Convert duration from days to seconds
      const durationInSeconds = parseInt(form.duration) * 24 * 60 * 60;
      // Convert interest rate to basis points (1% = 100)
      const interestRateBasisPoints = parseInt(form.interestRate) * 100;
      
      await createLoan(
        form.purpose,
        form.amount,
        interestRateBasisPoints,
        durationInSeconds
      );
      
      setForm({
        purpose: '',
        amount: '',
        interestRate: '',
        duration: ''
      });
    } catch (error) {
      console.error("Error creating loan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#1c1c24] flex flex-col p-4 rounded-[10px]">
      <h2 className="font-epilogue font-semibold text-[18px] text-white uppercase">Create a Loan Request</h2>
      
      <form onSubmit={handleSubmit} className="w-full mt-[20px] flex flex-col gap-[30px]">
        <div className="flex flex-col gap-[10px]">
          <label className="font-epilogue font-medium text-[14px] text-white">Loan Purpose</label>
          <input 
            type="text" 
            placeholder="What is this loan for?"
            className="py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[14px] placeholder:text-[#4b5264] rounded-[10px]"
            value={form.purpose}
            onChange={(e) => handleFormFieldChange('purpose', e)}
            required
          />
        </div>

        <div className="flex flex-col gap-[10px]">
          <label className="font-epilogue font-medium text-[14px] text-white">Loan Amount (ETH)</label>
          <input 
            type="number" 
            step="0.01"
            placeholder="0.1"
            className="py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[14px] placeholder:text-[#4b5264] rounded-[10px]"
            value={form.amount}
            onChange={(e) => handleFormFieldChange('amount', e)}
            required
          />
        </div>

        <div className="flex flex-col gap-[10px]">
          <label className="font-epilogue font-medium text-[14px] text-white">Interest Rate (%)</label>
          <input 
            type="number" 
            step="0.1"
            placeholder="5"
            className="py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[14px] placeholder:text-[#4b5264] rounded-[10px]"
            value={form.interestRate}
            onChange={(e) => handleFormFieldChange('interestRate', e)}
            required
          />
        </div>

        <div className="flex flex-col gap-[10px]">
          <label className="font-epilogue font-medium text-[14px] text-white">Duration (days)</label>
          <input 
            type="number" 
            placeholder="30"
            className="py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[14px] placeholder:text-[#4b5264] rounded-[10px]"
            value={form.duration}
            onChange={(e) => handleFormFieldChange('duration', e)}
            required
          />
        </div>
        <button
          type="submit"
          className="font-epilogue font-semibold text-[16px] leading-[26px] text-white min-h-[52px] px-4 rounded-[10px] bg-[#1dc071]"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Loan Request'}
        </button>
      </form>
    </div>
  );
};

export default LoanForm;