import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useStateContext } from '../context';
import { CustomButton, FormField, Loader } from '../components';
import { checkIfImage } from '../utils';

const CreateLoan = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { createLoan } = useStateContext();
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

    setIsLoading(true);
    try {
      await createLoan(
        form.purpose,
        form.amount,
        parseInt(form.interestRate * 100), // Convert to basis points (1% = 100)
        parseInt(form.duration) * 24 * 60 * 60 // Convert days to seconds
      );
      
      navigate('/loans');
    } catch (error) {
      console.error("Error creating loan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
      {isLoading && <Loader />}
      <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] bg-[#3a3a43] rounded-[10px]">
        <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white">Create a Loan</h1>
      </div>

      <form onSubmit={handleSubmit} className="w-full mt-[65px] flex flex-col gap-[30px]">
        <div className="flex flex-wrap gap-[40px]">
          <FormField 
            labelName="Loan Purpose *"
            placeholder="Why do you need this loan?"
            inputType="text"
            value={form.purpose}
            handleChange={(e) => handleFormFieldChange('purpose', e)}
          />
          <FormField 
            labelName="Amount (ETH) *"
            placeholder="0.50"
            inputType="number"
            value={form.amount}
            handleChange={(e) => handleFormFieldChange('amount', e)}
          />
        </div>

        <div className="flex flex-wrap gap-[40px]">
          <FormField 
            labelName="Interest Rate (%) *"
            placeholder="5"
            inputType="number"
            value={form.interestRate}
            handleChange={(e) => handleFormFieldChange('interestRate', e)}
          />
          <FormField 
            labelName="Duration (Days) *"
            placeholder="30"
            inputType="number"
            value={form.duration}
            handleChange={(e) => handleFormFieldChange('duration', e)}
          />
        </div>

        <div className="flex justify-center items-center mt-[40px]">
          <CustomButton 
            btnType="submit"
            title="Create Loan"
            styles="bg-[#1dc071]"
          />
        </div>
      </form>
    </div>
  );
};

export default CreateLoan;