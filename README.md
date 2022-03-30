# Domain Service on Polygon Layer 2

Warning!! App under development!
This app let's the user deploy a domain service that can mint domains in the form of NFTs.

### Solidity Instructions
Make sure you have the LTS version of Node installed.</br>
Install Hardhat
```shell
npm install --save-dev hardhat
```
Install dependencies. Might have been instaled automatically.
```shell
npm install --save-dev @nomiclabs/hardhat-waffle ethereum-waffle chai @nomiclabs/hardhat-ethers ethers mocha chai
npm install --save-dev @openzeppelin/contracts @openzeppelin/test-environment 
```

Create hardhat.config.js</br>
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
npx hardhat run test/test.js
```

Deploy Testnet
```shell
npx hardhat run scripts/deploy.js --network mumbai
```

Deploy Mainnet
```shell
npx hardhat run scripts/deploy.js --network polygon
```

### React Instructions
Change into the app directory</br>
Install React and other dependencies
```shell
npm install
```

Start development server
```shell
npm start
```