"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import contractABI from '../ABI.json';
import toast from 'react-hot-toast';


declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

const contractAddress = "0x332Fb35767182F8ac9F9C1405db626105F6694E0";

interface Web3ContextType {
  contractInstance: ethers.Contract | null;
  connectWallet: () => Promise<void>;
  signer: ethers.Signer | null;
  address: string | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [contractInstance, setContractInstance] = useState<ethers.Contract | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    if (window.ethereum && !contractInstance) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        const msg = "Please sign this message to verify ownership of your wallet.";
        const signature = await signer.signMessage(msg);

        const res = await fetch('http://localhost:5000/api/auth/metamask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ address, signature }),
        });

        const data = await res.json();

        if (data.success) {
          console.log("Login Success", data);
          setSigner(signer);
          setAddress(address);
          toast.success("Connected Successfully")
          const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);
          setContractInstance(contract);
          console.log("signer : " , signer)
          console.log("address : " , address)

        } else {
          console.error("Login Failed", data);
          alert(data.message)
        }


      } catch (error) {
        console.error("Wallet connection error:", error);
      }


    } else {
      alert("Please install MetaMask");
    }
  };

  return (
    <Web3Context.Provider
      value={{
        contractInstance,
        connectWallet,
        signer,
        address,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};





















































// "use client"



// import React, { createContext, useContext, useState, ReactNode } from 'react';
// import { ethers } from 'ethers';
// import contractABI from '../ABI.json';

// declare global {
//   interface Window {
//     ethereum?: ethers.Eip1193Provider;
//   }
// }

// const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// interface Web3ContextType {
//   contractInstance: ethers.Contract | null;
//   connectWallet: () => Promise<void>;
//   signer: ethers.Signer | null;
//   address: string | null;
// }

// const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// interface Web3ProviderProps {
//   children: ReactNode;
// }

// export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
//   const [contractInstance, setContractInstance] = useState<ethers.Contract | null>(null);
//   const [signer, setSigner] = useState<ethers.Signer | null>(null);
//   const [address, setAddress] = useState<string | null>(null);

//   const connectWallet = async () => {
//     if (window.ethereum && !contractInstance) {
//       try {
//         const provider = new ethers.BrowserProvider(window.ethereum);
//         const signer = await provider.getSigner();
//         const address = await signer.getAddress();

//         const msg = "Please sign this message to verify ownership of your wallet.";
//         const signature = await signer.signMessage(msg);

//         const res = await fetch('http://localhost:5000/api/auth/metamask', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           credentials: 'include',
//           body: JSON.stringify({ address, signature }),
//         });

//         const data = await res.json();

//         if (data.success) {
//           console.log("Login Success", data);
//           setSigner(signer);
//           setAddress(address);
//           const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);
//           setContractInstance(contract);
//           console.log("signer : ", signer);
//           console.log("address : ", address);
//         } else {
//           console.error("Login Failed", data);
//         }
//       } catch (error) {
//         console.error("Wallet connection error:", error);
//       }
//     } else {
//       alert("Please install MetaMask");
//     }
//   };

//   return (
//     <Web3Context.Provider
//       value={{
//         contractInstance,
//         connectWallet,
//         signer,
//         address,
//       }}
//     >
//       {children}
//     </Web3Context.Provider>
//   );
// };

// export const useWeb3 = (): Web3ContextType => {
//   const context = useContext(Web3Context);
//   if (!context) {
//     throw new Error('useWeb3 must be used within a Web3Provider');
//   }
//   return context;
// };

