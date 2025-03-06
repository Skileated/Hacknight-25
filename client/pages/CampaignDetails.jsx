import { NFTMinting } from '../components';

const CampaignDetails = () => {
  // ... existing code ...

  return (
    <div>
      {/* ... existing campaign details ... */}
      
      {/* Add NFT minting section */}
      <div className="mt-[60px]">
        <NFTMinting campaign={campaign} />
      </div>
      
      {/* ... rest of the component ... */}
    </div>
  );
};