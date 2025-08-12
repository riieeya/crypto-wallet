"use client"

import { useState } from "react";
import { generateMnemonic, mnemonicToSeed } from "bip39";
import { MnemonicDisplay } from "./MnemonicDisplay";
import { encodeBase58, HDNodeWallet } from "ethers";
import { Wallet } from "ethers";
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";
import { Keypair } from "@solana/web3.js";
import { Eye, EyeOff, Trash } from "lucide-react";
import { useEffect } from "react";

type EthWallet = {
  publicKey : string,
  privateKey : string
}

type SolWallet = {
  publicKey : string,
  privateKey : string
}

export const WalletPage = () => {
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [showMnemonic , setShowMnemonic] = useState(false);
  const [selectedChain , setSelectedChain] = useState<"solana" | "ethereum" | null>(null);

  const [solanaWallets , setSolanaWallets] = useState<SolWallet[]>([]);
  const [solanaIndex , setSolanaIndex] = useState(0);
  const [visibleSolPvtKeys , setVisibleSolPvtKeys] = useState<boolean[]>([])

  const [ethWallets , setEthWallets] = useState<EthWallet[]>([]);
  const [ethIndex , setEthIndex] = useState(0);
  const [visibleEthPvtKeys, setVisibleEthPvtKeys] = useState<boolean[]>([]);

  useEffect(() => {
    const savedMnemonic = localStorage.getItem("mnemonic");
    const savedSolWallets = localStorage.getItem("solWallets");
    const savedEthWallets = localStorage.getItem("ethWallets")
    if (savedMnemonic) {
      setMnemonic(JSON.parse(savedMnemonic))
    }

    if(savedSolWallets) {
      setSolanaWallets(JSON.parse(savedSolWallets))
    }

    if(savedEthWallets) {
      setEthWallets(JSON.parse(savedEthWallets))
    }
  }, []);

  const handleGenerate = () => {
    const m = generateMnemonic();
    const words = m.split(" ")
    setMnemonic(words);
    setShowMnemonic(true);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    alert("Copied to clipboard")
  }

  const addSolanaWallet = async () => {
    const seed = await mnemonicToSeed(mnemonic.join(" "));
    const path = `m/44'/501'/${solanaIndex}'/0'`;
    const derivedSeed = derivePath(path , seed.toString("hex")).key;
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
    const keyPair = Keypair.fromSecretKey(secret);
    
    setSolanaIndex(solanaIndex + 1);
    setSolanaWallets([...solanaWallets , {publicKey : keyPair.publicKey.toBase58(), privateKey: encodeBase58(keyPair.secretKey)}])
    setVisibleSolPvtKeys([...visibleSolPvtKeys, false]);
  }

  const addEtherumWallet = async () => {
    const seed = await mnemonicToSeed(mnemonic.join(" "));
    const derivationPath = `m/44'/60'/${ethIndex}'/0'`;
    const hdNode = HDNodeWallet.fromSeed(seed);
    const child = hdNode.derivePath(derivationPath);
    const privateKey = child.privateKey;
    const wallet = new Wallet(privateKey);

    setEthIndex(ethIndex + 1);
    setEthWallets([...ethWallets , { publicKey : wallet.address , privateKey : wallet.privateKey}]);
    setVisibleEthPvtKeys([...visibleEthPvtKeys, false]);
  }

  const toggleSolVisibility = (index: number) => {
    const updated = [...visibleSolPvtKeys];
    updated[index] = !updated[index]
    setVisibleSolPvtKeys(updated)
  }

  const toggleEthVisibility = (index: number) => {
    const updated = [...visibleEthPvtKeys];
    updated[index] = !updated[index]
    setVisibleEthPvtKeys(updated)
  }

  const handleSolDelete = (index: number) => {
    setSolanaWallets(solanaWallets.filter((_,i) => i !== index));
    setVisibleSolPvtKeys(visibleSolPvtKeys.filter((_,i) => i !== index))
  }

  const handleEthDelete = (index: number) => {
    setEthWallets(ethWallets.filter((_,i) => i !== index));
    setVisibleEthPvtKeys(visibleEthPvtKeys.filter((_,i) => i !== index))
  }
  

  useEffect(() => {
    localStorage.setItem("mnemonic" , JSON.stringify(mnemonic));
  }, [mnemonic]);

  useEffect(() => {
    localStorage.setItem("solWallets" , JSON.stringify(solanaWallets));
  },[solanaWallets]);

  useEffect(() => {
    localStorage.setItem("ethWallets" , JSON.stringify(ethWallets))
  }, [ethWallets]);

  return (
    <div className="flex flex-col gap-4">
      {mnemonic.length > 0 ? (
        <div className="flex flex-col w-full justify-center">
            <MnemonicDisplay
              showMnemonic={showMnemonic}
              setShowMnemonic={setShowMnemonic}
              mnemonicWords={mnemonic}
              copyToClipboard={copyToClipboard}
            />

            <p className="text-white/90 text-center font-semibold text-lg md:text-2xl py-8">
              Choose a blockchain
            </p>
            <div className="flex items-center justify-center gap-4">

              <button className={`px-4 py-2 text-lg font-semibold rounded-lg hover:cursor-pointer ${
                selectedChain === "solana" ? "bg-neutral-700 text-white" : "bg-white text-gray-900"
              }`} onClick={() => setSelectedChain("solana")}>
                Solana
              </button>

              <button className={`px-4 py-2 text-lg font-semibold rounded-lg hover:cursor-pointer ${ selectedChain === 'ethereum' ? "bg-neutral-700 text-white" : "bg-white text-gray-900" }`} onClick={() => setSelectedChain("ethereum")}>
                Ethereum
              </button>
            </div>

            {selectedChain === "solana" && (
              <div className="flex flex-col items-center mt-6"> 
                  <button
                    onClick={addSolanaWallet}
                    className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-300 hover:cursor-pointer"
                  >
                    Add Solana Wallet
                  </button>
                  <div className="mt-4 w-full max-w-7xl">
                    {solanaWallets.map((addr, i) => (
                      <div
                        key={i}
                        className="flex flex-col rounded-2xl border border-white/10 mt-8"
                      >
                        <div className="flex justify-between px-8 py-6">
                          <h3 className="font-bold text-2xl md:text-3xl tracking-tighter ">
                            Wallet - {i + 1}
                          </h3>
                          <button className="flex gap-2 items-center hover:cursor-pointer p-4 hover:bg-white/5 rounded-lg" onClick={() => handleSolDelete(i)}>
                            <Trash className="size-4 text-destructive" />
                          </button>
                        </div>
                        <div className="flex flex-col gap-8 px-8 py-4 rounded-2xl bg-gray-600/20">
                          <div className="flex flex-col w-full gap-2" onClick={() => copyToClipboard(addr.publicKey)}>
                              <span className="text-lg md:text-xl font-bold tracking-tighter">
                                Public Key
                              </span>
                              <p className="text-primary/80 font-medium cursor-pointer hover:text-primary transition-all duration-300 truncate">
                                {addr.publicKey}
                              </p>
                          </div>

                          <div className="flex flex-col w-full gap-2">
                            <span className="text-lg md:text-xl font-bold tracking-tighter">
                              Private Key
                            </span>
                            <div className="flex justify-between w-full items-center gap-2">
                              <p
                                onClick={() => copyToClipboard(addr.privateKey)}
                                className="text-primary/80 font-medium cursor-pointer hover:text-primary transition-all duration-300 truncate"
                              >
                                {visibleSolPvtKeys[i]
                                  ? addr.privateKey
                                  : "•".repeat(addr.privateKey.length)}
                              </p>
                              <button className="hover:cursor-pointer p-4 hover:bg-black/20 rounded-lg"
                                onClick={() => toggleSolVisibility(i)}
                              >
                                {visibleSolPvtKeys[i] ? (
                                  <EyeOff className="size-4" />
                                ) : (
                                  <Eye className="size-4" />
                                )}
                              </button>
                            </div>
                          </div> 
                        </div>
                      </div>
                    ))}
                  </div>
              </div>
            )}

            {selectedChain === "ethereum" && (
              <div className="flex flex-col items-center mt-6">
                <button
                  onClick={addEtherumWallet}
                  className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-300 hover:cursor-pointer" 
                >
                  Add ETH Wallet
                </button>
                <div className="mt-4 w-full max-w-7xl">
                  {ethWallets.map((addr, i) => (
                    <div
                        key={i}
                        className="flex flex-col rounded-2xl border border-white/10 mt-8"
                      >
                        <div className="flex justify-between px-8 py-6">
                          <h3 className="font-bold text-2xl md:text-3xl tracking-tighter ">
                            Wallet - {i + 1}
                          </h3>
                          <button className="flex gap-2 items-center hover:cursor-pointer p-4 hover:bg-white/5 rounded-lg" onClick={() => handleEthDelete(i)}>
                            <Trash className="size-4 text-destructive" />
                          </button>
                        </div>
                        <div className="flex flex-col gap-8 px-8 py-4 rounded-2xl bg-gray-600/20">
                          <div className="flex flex-col w-full gap-2" onClick={() => copyToClipboard(addr.publicKey)}>
                              <span className="text-lg md:text-xl font-bold tracking-tighter">
                                Public Key
                              </span>
                              <p className="text-primary/80 font-medium cursor-pointer hover:text-primary transition-all duration-300 truncate">
                                {addr.publicKey}
                              </p>
                          </div>

                          <div className="flex flex-col w-full gap-2">
                            <span className="text-lg md:text-xl font-bold tracking-tighter">
                              Private Key
                            </span>
                            <div className="flex justify-between w-full items-center gap-2">
                              <p
                                onClick={() => copyToClipboard(addr.privateKey)}
                                className="text-primary/80 font-medium cursor-pointer hover:text-primary transition-all duration-300 truncate"
                              >
                                {visibleEthPvtKeys[i]
                                  ? addr.privateKey
                                  : "•".repeat(addr.privateKey.length)}
                              </p>
                              <button className="hover:cursor-pointer p-4 hover:bg-black/20 rounded-lg"
                                onClick={() => toggleEthVisibility(i)}
                              >
                                {visibleEthPvtKeys[i] ? (
                                  <EyeOff className="size-4" />
                                ) : (
                                  <Eye className="size-4" />
                                )}
                              </button>
                            </div>
                          </div> 
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            )}

        </div> ) : (
          <div className="flex flex-col gap-2 my-12">
            <h1 className="tracking-tighter text-center text-4xl md:text-5xl font-black">
              Batua supports multiple blockchains
            </h1>
            <p className="text-gray-200/80 text-center font-semibold text-lg md:text-xl py-2">
              Get start by creating your Secret Pharase.
            </p>
            <div className="flex justify-center pt-4">
              <button
                className="px-6 py-2 bg-white text-gray-900 text-xl font-semibold rounded-lg hover:cursor-pointer"
                onClick={handleGenerate}
              >
                Generate
              </button>
            </div>
          </div> 
        )}
    </div>
  );
};
