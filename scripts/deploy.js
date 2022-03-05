const main = async () => {
  
  const domainContractFactory = await hre.ethers.getContractFactory('Domains');
  
  // Set Name Service
  const domainContract = await domainContractFactory.deploy("polygon");
  await domainContract.deployed();

  // Get contract address
  console.log("Contract deployed to:", domainContract.address);

  // Register Domain
  let txn = await domainContract.register("domains",  {value: hre.ethers.utils.parseEther('0.1')});
  await txn.wait();
  console.log("Minted domain domains.polygon");

  // Set record for the minted domain
  txn = await domainContract.setRecord("domains", "Polygon domain for the Polygon Domain Service");
  await txn.wait();
  console.log("Set record for domains.polygon");

  // Get Domain Owner
  const address = await domainContract.getAddress("domains");
  console.log("Owner of domain:", address);

  // Contract Balance
  const balance = await hre.ethers.provider.getBalance(domainContract.address);
  console.log("Contract balance:", hre.ethers.utils.formatEther(balance));
}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();