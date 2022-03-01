# Domain Service on Polygon Layer 2
## Under Development!!

## This app let's the user deploy a domain service that can mint domains in the form of NFTs.

### Instructions
Make sure you have the LTS version of Node installed.
Install dependencies
```shell
npm install --save-dev hardhat
```

Create hardhat.config.js
Warning DO NOT GIT ADD this file. Exclude it from the git tree with a .gitignore file!!  
```shell
require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.10",
  networks: {
		mumbai: {
      url: "[YOUR-ALCHEMY-URL]",
      accounts: ["[YOUR-PRIVATE KEY]"],
		},
    polygon: {
      url: "[YOUR-ALCHEMY-URL]",
      accounts: ["[YOUR-PRIVATE KEY]"],
		}
  }
};
```

Change Name Service
```shell
const domainContract = await domainContractFactory.deploy("name-service");
```

Change Domain
```shell
let txn = await domainContract.register("domain",  {value: hre.ethers.utils.parseEther('0.1')});
```
Note: Don't forget to also change the domain in: domainContract.setRecord and domainContract.getAddress


Test
```shell
npx hardhat scripts/run.js
```

Deploy Testnet
```shell
npx hardhat scripts/deploy.js --network mumbai
```

Deploy Mainnet
```shell
npx hardhat scripts/deploy.js --network polygon
```