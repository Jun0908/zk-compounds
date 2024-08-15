## WaveHack Global 2024

### ▶︎Overview
ChaCha-GPT is a Web3 service offering a "music generation protocol and music NFT storage system" to create spaces that make travel enjoyable and bring people together.

**Text to Image **　　
<div >
<img width="200" alt="TexttoImage" src="https://github.com/Jun0908/Chacha-GPT/assets/31527310/a19c2360-4ab7-4e4f-ad92-5b51b61b06a4">
</div>

**Text to Music **　　  
[Play Music](https://mubert.com/render/tracks/094a91f685064b0dbe1f43cb8995c063)

### ▶︎Problems
  
"There are many things that hinder the joy of travel." This problem encompasses a wide range of issues, including traffic jams, drowsy driving, repetitive travel, long journeys, and boring routes. There is a demand for services that make the journey itself more enjoyable using Web3 technology.
   
### ▶︎Solution
**Music Generation Protocol & On-chain Music Storage System**　　  
Our developed tool utilizes AI to easily generate music from photos taken with a smartphone. It leverages Web3 technologies such as smart contracts, NFTs, and wallets to allow anyone to issue music NFTs.

### ▶︎Technical Challenges
**No Cloud, All dApps**　　  
Generative AI is implemented without using cloud systems like AWS, GCP, or Azure, by leveraging decentralized storage via IPFS and decentralized computing with Bacalhau.
<img width="992" alt="スクリーンショット 2024-05-17 9 41 09" src="https://github.com/Jun0908/Chacha-GPT/assets/31527310/15853270-25c4-40cf-98b8-469b8b339ce6">

**On-chain Music Data Storage**　　  
We converted music WAV data to spectrogram images and used Numpy arrays, byte sequences, and hexadecimal strings to store the music data on-chain.
<img width="896" alt="スクリーンショット 2024-05-11 16 51 35" src="https://github.com/Jun0908/Chacha-GPT/assets/31527310/18c17208-bc79-4123-9fe6-4b4140e75731">

### ▶︎Creativity 
**Open Generative AI Platform**        
All information about the generative AI model and image-to-music generation is publicly available. This allows users to share conditions for generation and utilize the system for analysis or research purposes. While pre-trained models like those used in Deep Learning aim to improve accuracy using test data, the evaluation criteria are singular. However, it is challenging to objectively evaluate generative AI, such as in music. We aim to create pre-trained models for generative AI that encompass diversity, transparency, and copyright protection.

### ▶︎Implementation Status

| Title          |                                                              URL |
| :------------- | ---------------------------------------------------------------: |
| Demo Movie      |                                      [https://youtu.be/zmENJzrxZRw](https://www.youtube.com/watch?v=0oHdkLbcIxo)|
| Pitch Doc    |   [chachacha-presentation](https://www.canva.com/design/DAGGwRbt5IY/1LIg2Vl4maaYLQfox-Q6Sg/edit?utm_content=DAGGwRbt5IY&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton) |
| Demo Site     |                                 [chachacha-demo](https://next-app-umber-kappa.vercel.app/) | 
| Contract   | [chachacha-contracts](https://github.com/Jun0908/Chacha-GPT/tree/main/contract) |
| Frontend |         [chachacha-front](https://github.com/Jun0908/Chacha-GPT/tree/main/next-app) |
| Garally　　 |         [chachacha-garally](https://3d-image-to-music.vercel.app/) |

**Contract**

| contract                   |                                                                                                                   contract address |
| :------------------------- | ---------------------------------------------------------------------------------------------------------------------------------: |
| Manta Testnet    | [0xD767A205Bd71b72919273101dEd72068f49CF51F](https://pacific-explorer.sepolia-testnet.manta.network/address/0xD767A205Bd71b72919273101dEd72068f49CF51F)|
| zkSync Testnet    | [0xC502e62C2Dc0686044572465A653CdF81Ca15A48](https://sepolia.explorer.zksync.io/address/0xC502e62C2Dc0686044572465A653CdF81Ca15A48#contract)|
