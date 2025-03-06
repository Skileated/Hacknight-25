import React, { useContext, createContext } from 'react';

import { useAddress, useContract, useMetamask, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import { EditionMetadataWithOwnerOutputSchema } from '@thirdweb-dev/sdk';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const { contract } = useContract('0xf59A1f8251864e1c5a6bD64020e3569be27e6AA9');
  // Updated with the correct MicroFinance contract address
  const { contract: microFinanceContract } = useContract('0x967fFB6dff78B055F1Bc5f8987Ba9b0b6d1124F0');
  const { mutateAsync: createCampaign } = useContractWrite(contract, 'createCampaign');

  const address = useAddress();
  const connect = useMetamask();

  const publishCampaign = async (form) => {
    try {
      const data = await createCampaign({
				args: [
					address, // owner
					form.title, // title
					form.description, // description
					form.target,
					new Date(form.deadline).getTime(), // deadline,
					form.image,
				],
			});

      console.log("contract call success", data)
      return data;
    } catch (error) {
      console.log("contract call failure", error)
      throw error;
    }
  }

  const getCampaigns = async () => {
    const campaigns = await contract.call('getCampaigns');

    const parsedCampaings = campaigns.map((campaign, i) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
      image: campaign.image,
      pId: i
    }));

    return parsedCampaings;
  }

  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();

    const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address);

    return filteredCampaigns;
  }

  const donate = async (pId, amount) => {
    const data = await contract.call('donateToCampaign', [pId], { value: ethers.utils.parseEther(amount)});

    return data;
  }

  const getDonations = async (pId) => {
    const donations = await contract.call('getDonators', [pId]);
    const numberOfDonations = donations[0].length;

    const parsedDonations = [];

    for(let i = 0; i < numberOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString())
      })
    }

    return parsedDonations;
  }

  // Add this to your existing context provider functions
  
  const createLoan = async (purpose, amount, interestRate, duration) => {
    try {
      if (!microFinanceContract) {
        throw new Error("MicroFinance contract not initialized");
      }
      
      const data = await microFinanceContract.call(
        'createLoan',
        [purpose, ethers.utils.parseEther(amount), interestRate, duration]
      );
      
      console.log("Loan created successfully:", data);
      return data;
    } catch (error) {
      console.error("Error creating loan:", error);
      throw error;
    }
  };
  
  // Add this near the beginning of your component
  console.log("Crowdfunding contract:", contract);
  console.log("MicroFinance contract:", microFinanceContract);
  
  // And modify your getLoans function to include better error handling
  const getLoans = async () => {
    try {
      if (!microFinanceContract) {
        console.error("MicroFinance contract not initialized");
        return [];
      }
      
      console.log("Fetching number of loans...");
      const numberOfLoans = await microFinanceContract.call('numberOfLoans');
      console.log("Number of loans:", numberOfLoans);
      const loans = [];
      
      for (let i = 0; i < numberOfLoans; i++) {
        console.log(`Fetching loan ${i}...`);
        const loanData = await microFinanceContract.call('getLoanDetails', [i]);
        console.log(`Loan ${i} data:`, loanData);
        
        loans.push({
          id: i,
          borrower: loanData.borrower,
          purpose: loanData.purpose,
          amount: ethers.utils.formatEther(loanData.amount),
          interestRate: loanData.interestRate,
          duration: loanData.duration,
          startTime: loanData.startTime,
          endTime: loanData.endTime,
          amountRepaid: ethers.utils.formatEther(loanData.amountRepaid),
          status: loanData.status,
          totalContributed: ethers.utils.formatEther(loanData.totalContributed)
        });
      }
      
      return loans;
    } catch (error) {
      console.error("Error getting loans:", error);
      return [];
    }
  };
  
  const fundLoan = async (loanId, amount) => {
    try {
      if (!microFinanceContract) {
        throw new Error("MicroFinance contract not initialized");
      }
      
      const data = await microFinanceContract.call(
        'fundLoan',
        [loanId],
        { value: ethers.utils.parseEther(amount) }
      );
      
      console.log("Loan funded successfully:", data);
      return data;
    } catch (error) {
      console.error("Error funding loan:", error);
      throw error;
    }
  };
  
  const repayLoan = async (loanId, amount) => {
    try {
      if (!microFinanceContract) {
        throw new Error("MicroFinance contract not initialized");
      }
      
      const data = await microFinanceContract.call(
        'repayLoan',
        [loanId],
        { value: ethers.utils.parseEther(amount) }
      );
      
      console.log("Loan repaid successfully:", data);
      return data;
    } catch (error) {
      console.error("Error repaying loan:", error);
      throw error;
    }
  };
  
  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        connect,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
        // MicroFinance functions
        createLoan,
        getLoans,
        fundLoan,
        repayLoan
      }}
    >
      {children}
    </StateContext.Provider>
  );
}

export const useStateContext = () => useContext(StateContext);