require('dotenv').config();
const Web3 = require("web3");
const opensea = require("opensea-js");
const { WyvernSchemaName } = require('opensea-js/lib/types');
const OpenSeaPort = opensea.OpenSeaPort;
const Network = opensea.Network;
const MnemonicWalletSubprovider = require("@0x/subproviders")
  .MnemonicWalletSubprovider;
const HDWalletProvider = require("@truffle/hdwallet-provider");

const RPCSubprovider = require("web3-provider-engine/subproviders/rpc");
const Web3ProviderEngine = require("web3-provider-engine");

const MNEMONIC = process.env.MNEMONIC;
const NODE_API_KEY = process.env.INFURA_KEY || process.env.ALCHEMY_KEY;
const isInfura = !!process.env.INFURA_KEY;
// const FACTORY_CONTRACT_ADDRESS = process.env.FACTORY_CONTRACT_ADDRESS;
// const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
const OWNER_ADDRESS = process.env.OWNER_ADDRESS;
const NETWORK = process.env.NETWORK;
const API_KEY = process.env.API_KEY || ""; // API key is optional but useful if you're doing a high volume of requests.

// if (!MNEMONIC || !NODE_API_KEY || !NETWORK || !OWNER_ADDRESS) {
//   console.error(
//     "Please set a mnemonic, Alchemy/Infura key, owner, network, API key, nft contract, and factory contract address."
//   );
//   return;
// }

// if (!FACTORY_CONTRACT_ADDRESS && !NFT_CONTRACT_ADDRESS) {
//   console.error("Please either set a factory or NFT contract address.");
//   return;
// }

// const BASE_DERIVATION_PATH = `44'/60'/0'/0`;

// const mnemonicWalletSubprovider = new MnemonicWalletSubprovider({
//   mnemonic: MNEMONIC,
//   baseDerivationPath: BASE_DERIVATION_PATH,
// });

const network =
  NETWORK === "mainnet" || NETWORK === "live" ? "mainnet" : "rinkeby";

const infuraRpcSubprovider = new RPCSubprovider({
  rpcUrl: isInfura
    ? "https://" + network + ".infura.io/v3/" + NODE_API_KEY
    : "https://eth-" + network + ".alchemyapi.io/v2/" + NODE_API_KEY,
});

console.log("infuraRpcSubprovider: ", infuraRpcSubprovider);
const walletProvider = new HDWalletProvider(process.env.privateKey, "https://mainnet.infura.io/v3/" + NODE_API_KEY);

// const providerEngine = new Web3ProviderEngine();
// providerEngine.addProvider(mnemonicWalletSubprovider);
// providerEngine.addProvider(walletProvider);
// providerEngine.addProvider(infuraRpcSubprovider);
// providerEngine.start();

// const seaport = new OpenSeaPort(
//   providerEngine,
//   {
//     networkName:
//       NETWORK === "mainnet" || NETWORK === "live"
//         ? Network.Main
//         : Network.Rinkeby,
//     apiKey: API_KEY,
//   },
//   (arg) => console.log(arg)
// );

const seaport = new OpenSeaPort(walletProvider, {
  networkName: Network.Main,
  apiKey: API_KEY
});

var fs = require('fs');
var { stringify } = require('csv');;
let axios = require('axios');
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['X-API-KEY'] = process.env.API_KEY;

async function main() {

  console.log("hello");
  //get events
  const userAddress = '';
  
  const response = await axios({
      method: 'get',
      url: process.env.OPENSEA_MAINNET_API_URL +'v1/events?only_opensea=true&account_address=' + userAddress +'&event_type=successful',  // get events from specific address
  });

  var data = [];
  var assets = [];
  if (response.data && response.data.asset_events) {
      const asset_events = response.data.asset_events;
      // console.log("asset_events: ", asset_events);
      for (var i=0; i < asset_events.length; i++) {
        if (asset_events[i].seller.address != userAddress) {
          data.push({
              'userAddress': userAddress,
              'collectionSlug': asset_events[i].collection_slug,
              'collectionAddress': asset_events[i].contract_address
          });
          break;
        }
      } // for end

      console.log("data: ",  data);
      // write data
      stringify(data, {
        header: true
      }, function (err, output) {
          // console.log("output: ", output);
          fs.writeFile(`./output/wallets.csv`, output, (err) => {
              if (err)
                  console.log(err);
              else {
                  console.log("File written successfully\n");
              }
          });
      });

  }

  // Example: simple fixed-price sale of an item owned by a user.
  // console.log("Auctioning an item for a fixed price...");
  // const fixedPriceSellOrder = await seaport.createSellOrder({
  //   asset: {
  //     tokenId: "1",
  //     tokenAddress: NFT_CONTRACT_ADDRESS,
  //     schemaName: WyvernSchemaName.ERC721
  //   },
  //   startAmount: 0.05,
  //   expirationTime: 0,
  //   accountAddress: OWNER_ADDRESS,
  // });
  // console.log(
  //   `Successfully created a fixed-price sell order! ${fixedPriceSellOrder.asset.openseaLink}\n`
  // );

  // // // Example: Dutch auction.
  // console.log("Dutch auctioning an item...");
  // const expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24);
  // const dutchAuctionSellOrder = await seaport.createSellOrder({
  //   asset: {
  //     tokenId: "2",
  //     tokenAddress: NFT_CONTRACT_ADDRESS,
  //     schemaName: WyvernSchemaName.ERC721
  //   },
  //   startAmount: 0.05,
  //   endAmount: 0.01,
  //   expirationTime: expirationTime,
  //   accountAddress: OWNER_ADDRESS,
  // });
  // console.log(
  //   `Successfully created a dutch auction sell order! ${dutchAuctionSellOrder.asset.openseaLink}\n`
  // );

  // // Example: English auction.
  // console.log("English auctioning an item in DAI...");
  // const wethAddress =
  //   NETWORK === "mainnet" || NETWORK === "live"
  //     ? "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
  //     : "0xc778417e063141139fce010982780140aa0cd5ab";
  // const englishAuctionSellOrder = await seaport.createSellOrder({
  //   asset: {
  //     tokenId: "3",
  //     tokenAddress: NFT_CONTRACT_ADDRESS,
  //     schemaName: WyvernSchemaName.ERC721
  //   },
  //   startAmount: 0.03,
  //   expirationTime: expirationTime,
  //   waitForHighestBid: true,
  //   paymentTokenAddress: wethAddress,
  //   accountAddress: OWNER_ADDRESS,
  // });
  // console.log(
  //   `Successfully created an English auction sell order! ${englishAuctionSellOrder.asset.openseaLink}\n`
  // );
}

main();