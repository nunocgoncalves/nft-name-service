# ENS on Polygon Layer 2

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