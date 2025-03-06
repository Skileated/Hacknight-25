// Add these NFT-related functions to your existing context
export const StateContextProvider = ({ children }) => {
  // ... existing code ...

  const mintCampaignNFT = async (pId) => {
    try {
      const data = await contract.call('mintCampaignNFT', pId);
      console.log("NFT minted successfully", data);
      return data;
    } catch (error) {
      console.error("NFT minting failed:", error);
      throw error;
    }
  }

  const getCampaignNFTDetails = async (pId) => {
    try {
      const data = await contract.call('getCampaignNFTDetails', pId);
      return { hasNFT: data[0], tokenId: data[1].toNumber() };
    } catch (error) {
      console.error("Failed to get NFT details:", error);
      throw error;
    }
  }

  return (
    <StateContext.Provider
      value={{
        // ... existing values ...
        mintCampaignNFT,
        getCampaignNFTDetails,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};