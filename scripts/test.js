const main = async () => {

  const [owner, robber] = await hre.ethers.getSigners();
  const domainContractFactory = await hre.ethers.getContractFactory('Domains');

  // Set domain service and deploy contract
  const domainContract = await domainContractFactory.deploy("polygon");
  await domainContract.deployed();

  // Get contract address
  console.log("Contract owner:", owner.address);

  // Register domain
  let txn = await domainContract.register("domains",  {value: hre.ethers.utils.parseEther('1234')});
  await txn.wait();
  console.log("Minted domain domains.polygon");

  // Set record for the minted domain
  txn = await domainContract.setRecord("domains", "Polygon domain for the Polygon Domain Service");
  await txn.wait();
  console.log("Set record for domains.polygon");

  // Get Domain Owner
  const address = await domainContract.getAddress("domains");
  console.log("Owner of domain:", address);

  // Contract Balance before withdrawl
  const balance = await hre.ethers.provider.getBalance(domainContract.address);
  console.log("Contract balance before withdrawl:", hre.ethers.utils.formatEther(balance));

  // Attemp Withdraw (without being the owner)
  try {
    txn = await domainContract.connect(robber).withdraw();
    await txn.wait();
  } catch(error){
    console.log("You do not have the permission to do that!");
  }

  // Owner's Balance before withdrawl
  let ownerBalance = await hre.ethers.provider.getBalance(owner.address);
  console.log("Balance of owner before withdrawal:", hre.ethers.utils.formatEther(ownerBalance));

  // Withdraw (as the owner)
  txn = await domainContract.connect(owner).withdraw();
  await txn.wait();
  
  // Contract Balance after withdrawl
  const contractBalance = await hre.ethers.provider.getBalance(domainContract.address);
  console.log("Contract balance after withdrawal:", hre.ethers.utils.formatEther(contractBalance));

  // Owner's Balance after withdrawl
  ownerBalance = await hre.ethers.provider.getBalance(owner.address);
  console.log("Balance of owner after withdrawal:", hre.ethers.utils.formatEther(ownerBalance));
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