
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Transaction } from "@solana/web3.js"
import { Button } from "@/components/ui/button"
import { mintNFT, upload, uploadMetadata, createTree } from "@/lib/shyft"


import background from "@/public/images/background-illustration.png";
import { useEffect, useState } from "react"

interface CreateNftProps {
    first: string;
    second: string;
    third: string;
    race: string;
    hasDuplicate: boolean;
    
  }
  
  const CreateNft: React.FC<CreateNftProps> = ({ first, second, third, race, hasDuplicate }) => {

    const { toast } = useToast()
    const { connected, publicKey, sendTransaction } = useWallet()
    const { connection } = useConnection()

    const [backgroundFile, setBackgroundFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchBackgroundFile = async () => {
            const response = await fetch(background.src);
            const blob = await response.blob();
            setBackgroundFile(new File([blob], "background.png", { type: "image/png" }));
        };
        fetchBackgroundFile();
    }, []);
    // Use the props as needed

    const attributes = {
        "Pos 1.": first,
        "Pos 2.": second,
        "Pos 3.": third,
        Race: race,
        Points: "To be evaluated", // TODO: If race results exist, points can be evaluated and rendered here
      };
    const handleMint = async () => {
        try {
            if (hasDuplicate) {
                toast("Duplicate drivers are not allowed");
                return;
              }
              
              if (!publicKey) {
                toast({
                  variant: "warning",
                  title: "Please connect to your wallet",
                })
                return
              }


              const tree = await createTree({
                wallet_address: publicKey.toBase58(),
                network: "devnet",
                max_depth_size_pair: {
                  max_depth: 14,
                  max_buffer_size: 64,
                },
                canopy_depth: 10,
                fee_payer: publicKey.toBase58(),
              }
             )

             if (backgroundFile) { // Check if backgroundFile is not null
                
            } else {
                toast({
                  variant: "error",
                  title: "Background file not loaded",
                });
                return;
            }
            const uploadResponse  = await upload(backgroundFile);
              if (!uploadResponse.success) {
                toast({
                  variant: "error",
                  title: "Upload error",
                  description: uploadResponse.message ?? "Unknown error",
                })
                return
              }
        
              const uploadMetadataResponse = await uploadMetadata({
                name: race,
                symbol: "BN",
               
                image: uploadResponse.result.uri,
                
                attributes:  [first],
                files: [
                  {
                    uri: uploadResponse.result.uri,
                    type: "image/png",
                  },
                ],
               
                creator: publicKey.toBase58(),
              })

              if (!uploadMetadataResponse.success) {
                toast({
                  variant: "error",
                  title: "Upload error",
                  description: uploadMetadataResponse.message ?? "Unknown error",
                })
                return
              }
        
              const response = await mintNFT({
                creator_wallet: publicKey.toBase58(),
                metadata_uri: uploadMetadataResponse.result.uri,
                merkle_tree: tree.result.tree,
                collection_address: "",
                receiver: publicKey.toBase58(),
                fee_payer: publicKey.toBase58(),
                network: "devnet",
              })
        
              if (response.success) {
                const tx = Transaction.from(Buffer.from(response.result.encoded_transaction, "base64"))
                const signature = await sendTransaction(tx, connection)
                await connection.confirmTransaction(signature, "confirmed")
        
                toast({
                  variant: "success",
                  title: "Your NFT minted successfully",
                  description: (
                    <a
                      className="underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://translator.shyft.to/tx/${signature}?cluster=${values.network}`}
                    >
                      View transaction
                    </a>
                  ),
                })}
        } catch (error) {
            
        }
    };
  
    return (
      <div>
        
        <Button onClick={handleMint}>Mint</Button>
      </div>
    );
  };
  
  export default CreateNft;

function useToast(): { toast: any } {
    throw new Error("Function not implemented.")
}
