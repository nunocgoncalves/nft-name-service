const main = async () => {
  
  const domainContractFactory = await hre.ethers.getContractFactory('Domains');
  
  // Set Name Service
  const domainContract = await domainContractFactory.deploy("delta");
  await domainContract.deployed();

  // Get contract address
  console.log("Contract deployed to:", domainContract.address);

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