import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import { useStateContext } from '../context';
import { CountBox, CustomButton, Loader } from '../components';
import { calculateBarPercentage, daysLeft } from '../utils';
import { thirdweb } from '../assets';

const LoanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { address, getLoans, fundLoan, repayLoan } = useStateContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [loan, setLoan] = useState(null);
  
  const fetchLoan = async () => {
    setIsLoading(true);
    try {
      const loans = await getLoans();
      const currentLoan = loans.find(l => l.id === parseInt(id));
      setLoan(currentLoan);
    } catch (error) {
      console.error("Error fetching loan details:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (address) fetchLoan();
  }, [address, id]);
  
  const handleFundLoan = async () => {
    setIsLoading(true);
    try {
      await fundLoan(loan.id, amount);
      navigate('/loans');
    } catch (error) {
      console.error("Error funding loan:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRepayLoan = async () => {
    setIsLoading(true);
    try {
      await repayLoan(loan.id, amount);
      navigate('/loans');
    } catch (error) {
      console.error("Error repaying loan:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStatusText = (status) => {
    switch(status) {
      case 0: return 'Pending';
      case 1: return 'Active';
      case 2: return 'Repaid';
      case 3: return 'Defaulted';
      default: return 'Unknown';
    }
  };
  
  if (isLoading || !loan) {
    return (
      <div className="flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
        <Loader />
      </div>
    );
  }
  
  const remainingDays = loan.endTime > 0 ? 
    daysLeft(new Date(loan.endTime * 1000)) : 
    daysLeft(new Date(Date.now() + loan.duration * 1000));
  
  const isOwner = address === loan.borrower;
  const isActive = loan.status === 1; // Active status
  const isPending = loan.status === 0; // Pending status

  return (
    <div>
      <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
        <div className="flex-1 flex-col">
          <div className="relative w-full h-[5px] bg-[#3a3a43]">
            <div className="absolute h-full bg-[#4acd8d]" style={{ width: `${calculateBarPercentage(loan.amount, loan.totalContributed)}%`, maxWidth: '100%' }}></div>
          </div>
          
          <div className="mt-[60px] flex lg:flex-row flex-col gap-5">
            <div className="flex-[2] flex flex-col gap-[40px]">
              <div>
                <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Borrower</h4>
                <div className="mt-[20px] flex flex-row items-center flex-wrap gap-[14px]">
                  <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-[#2c2f32] cursor-pointer">
                    <img src={thirdweb} alt="user" className="w-[60%] h-[60%] object-contain" />
                  </div>
                  <div>
                    <h4 className="font-epilogue font-semibold text-[14px] text-white break-all">{loan.borrower}</h4>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Purpose</h4>
                <div className="mt-[20px]">
                  <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">{loan.purpose}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Loan Details</h4>
                <div className="mt-[20px] flex flex-col gap-4">
                  <div className="flex justify-between">
                    <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px]">Amount:</p>
                    <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px]">{loan.amount} ETH</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px]">Interest Rate:</p>
                    <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px]">{loan.interestRate / 100}%</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px]">Duration:</p>
                    <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px]">{loan.duration / (24 * 60 * 60)} days</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px]">Status:</p>
                    <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px]">{getStatusText(loan.status)}</p>
                  </div>
                  {loan.startTime > 0 && (
                    <div className="flex justify-between">
                      <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px]">Start Date:</p>
                      <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px]">{new Date(loan.startTime * 1000).toLocaleDateString()}</p>
                    </div>
                  )}
                  {loan.endTime > 0 && (
                    <div className="flex justify-between">
                      <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px]">End Date:</p>
                      <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px]">{new Date(loan.endTime * 1000).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Loan Progress</h4>
              
              <div className="mt-[20px] flex flex-col p-4 bg-[#1c1c24] rounded-[10px]">
                <div className="flex flex-col mb-[20px] gap-[30px]">
                  <CountBox title="Days Left" value={remainingDays} />
                  <CountBox title="Total Contributed" value={`${loan.totalContributed} ETH`} />
                  <CountBox title="Amount Repaid" value={`${loan.amountRepaid} ETH`} />
                </div>
                
                {isPending && !isOwner && (
                  <div className="flex flex-col gap-[10px]">
                    <div className="flex flex-col gap-[10px]">
                      <p className="font-epilogue font-medium text-[20px] leading-[30px] text-center text-[#808191]">
                        Fund this loan
                      </p>
                      <div className="mt-[30px]">
                        <input 
                          type="number"
                          placeholder="ETH 0.1"
                          step="0.01"
                          className="w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[18px] leading-[30px] placeholder:text-[#4b5264] rounded-[10px]"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                        
                        <div className="my-[20px] p-4 bg-[#13131a] rounded-[10px]">
                          <h4 className="font-epilogue font-semibold text-[14px] leading-[22px] text-white">Support this borrower</h4>
                          <p className="mt-[20px] font-epilogue font-normal leading-[22px] text-[#808191]">
                            Help fund this loan and earn interest on your contribution.
                          </p>
                        </div>
                        
                        <CustomButton 
                          btnType="button"
                          title="Fund Loan"
                          styles="w-full bg-[#8c6dfd]"
                          handleClick={handleFundLoan}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {isActive && isOwner && (
                  <div className="flex flex-col gap-[10px]">
                    <div className="flex flex-col gap-[10px]">
                      <p className="font-epilogue font-medium text-[20px] leading-[30px] text-center text-[#808191]">
                        Repay your loan
                      </p>
                      <div className="mt-[30px]">
                        <input 
                          type="number"
                          placeholder="ETH 0.1"
                          step="0.01"
                          className="w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[18px] leading-[30px] placeholder:text-[#4b5264] rounded-[10px]"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                        
                        <div className="my-[20px] p-4 bg-[#13131a] rounded-[10px]">
                          <h4 className="font-epilogue font-semibold text-[14px] leading-[22px] text-white">Repay your loan</h4>
                          <p className="mt-[20px] font-epilogue font-normal leading-[22px] text-[#808191]">
                            Make a repayment on your active loan. Repaying on time helps build your reputation.
                          </p>
                        </div>
                        
                        <CustomButton 
                          btnType="button"
                          title="Repay Loan"
                          styles="w-full bg-[#1dc071]"
                          handleClick={handleRepayLoan}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanDetails;