import React, { useState } from 'react';
import { useStateContext } from '../context';

const NFTMinting = ({ campaign }) => {
  const { mintCampaignNFT, getCampaignNFTDetails } = useStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [nftDetails, setNftDetails] = useState(null);

  const handleMintNFT = async () => {
    try {
      setIsLoading(true);
      await mintCampaignNFT(campaign.pId);
      const details = await getCampaignNFTDetails(campaign.pId);
      setNftDetails(details);
    } catch (error) {
      console.error("Error minting NFT:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#1c1c24] flex flex-col p-4 rounded-[10px]">
      <h2 className="font-epilogue font-semibold text-[18px] text-white uppercase">Campaign NFT</h2>
      
      {nftDetails?.hasNFT ? (
        <div className="mt-[20px]">
          <p className="font-epilogue font-normal text-[16px] text-[#808191]">
            NFT Token ID: {nftDetails.tokenId}
          </p>
        </div>
      ) : (
        campaign.status === "Ended" && campaign.amountCollected >= campaign.target && (
          <button
            className="font-epilogue font-semibold text-[16px] leading-[26px] text-white min-h-[52px] px-4 rounded-[10px] bg-[#1dc071] mt-[20px]"
            onClick={handleMintNFT}
            disabled={isLoading}
          >
            {isLoading ? 'Minting...' : 'Mint Campaign NFT'}
          </button>
        )
      )}
    </div>
  );
};

export default NFTMinting;