import {useContract} from './useContract';
import TheTasteExperienceAbi from '../contracts/TheTasteExperience.json';
import TheTasteExperienceContractAddress from '../contracts/TheTasteExperience-address.json';


// export interface for NFT contract
export const useMinterContract = () => useContract(TheTasteExperienceAbi.abi, TheTasteExperienceContractAddress.TheTasteExperience);