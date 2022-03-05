import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";
import { networks } from './utils/networks';
import contractAbi from './utils/contractABI.json';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';

// Constants
const TWITTER_HANDLE = 'nunomiguelcg';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const tld = '.polygon';
const CONTRACT_ADDRESS = '0xCdd529A3464826c9E4bdB29f1bcB8e322C26855e';

const App = () => {

	// Create a stateful variable to store the network next to all the others
	const [network, setNetwork] = useState('');

	// State variable that stores the user's public wallet address
	const [currentAccount, setCurrentAccount] = useState('');
	const [domain, setDomain] = useState('');
	const [record, setRecord] = useState('');

	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert("Get MetaMask -> https://metamask.io/");
				return;
			}

			// Request access to account
			const accounts = await ethereum.request({ method: "eth_requestAccounts" });
		
			// Prints account public address
			console.log("Connected", accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error)
		}
	}
	
	const checkIfWalletIsConnected = async () => {
		
		// Get access to ethereum window
		const { ethereum } = window;

		if (!ethereum) {
			console.log('Make sure you have metamask!');
			return;
		} else {
			console.log('We have the ethereum object', ethereum);
		}
		
		// Check for authorization to access the user's wallet
		const accounts = await ethereum.request({ method: 'eth_accounts' });

		// Checks for authorized accounts
		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log('Found an authorized account:', account);
			setCurrentAccount(account);
		} else {
			console.log('No authorized account found');
		}
		
		// Check the network chain ID
		const chainId = await ethereum.request({ method: 'eth_chainId' });
		setNetwork(networks[chainId]);

		ethereum.on('chainChanged', handleChainChanged);
		
		// Reload page after the network is changed
		function handleChainChanged(_chainId) {
			window.location.reload();
		}
	};

	const switchNetwork = async () => {
		if (window.ethereum) {
			try {
				// Switch Network
				await window.ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: '0x13881' }], // Check networks.js for hexadecimal network ids
				});
			} catch (error) {
				// Chain is not on Metamask
				if (error.code === 4902) {
					// Try to add the chain
					try {
						await window.ethereum.request({
							method: 'wallet_addEthereumChain',
							params: [
								{	
									chainId: '0x13881',
									chainName: 'Polygon Mumbai Testnet',
									rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
									nativeCurrency: {
											name: "Mumbai Matic",
											symbol: "MATIC",
											decimals: 18
									},
									blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
								},
							],
						});
					} catch (error) {
						console.log(error);
					}
				}
				console.log(error);
			}
		} else {
			// Metamask is not installed
			alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
		} 
	}

	const mintDomain = async () => {
		// Don't run if the domain is empty
		if (!domain) { return }
		// Alert the user if the domain is too short
		if (domain.length < 2) {
			alert('Domain must be at least 2 characters long!');
			return;
		}
		// Calculate price based on length of domain	
		// 3 chars = 0.5 MATIC, 4 chars = 0.3 MATIC, 5 or more = 0.1 MATIC
		const price = domain.length === 3 ? '0.005' : domain.length === 4 ? '0.003' : '0.001';
		console.log("Minting domain", domain, "with price", price);
	  
		try {
		const { ethereum } = window;
		
		if (ethereum) {
		  const provider = new ethers.providers.Web3Provider(ethereum);
		  const signer = provider.getSigner();
		  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);
		  console.log("Going to pop wallet now to pay gas...")
		  
		  let tx = await contract.register(domain, {value: ethers.utils.parseEther(price)});
		        
		        // Wait for the transaction to be mined
				const receipt = await tx.wait();

				// Check if the transaction was successfully completed
				if (receipt.status === 1) {
					console.log("Domain minted! https://mumbai.polygonscan.com/tx/"+tx.hash);
					
					// Set the record for the domain
					tx = await contract.setRecord(domain, record);
					await tx.wait();
					console.log("Record set! https://mumbai.polygonscan.com/tx/"+tx.hash);
					
					setRecord('');
					setDomain('');
				}
				else {
					alert("Transaction failed! Please try again");
				}
		}
	  }
	  catch(error){
		console.log(error);
	  }
	}

	// Render Methods
	const renderNotConnectedContainer = () => (
		<div className="connect-wallet-container">
			{/* Calls the function once the button is clicked */}
			<button onClick={connectWallet} className="cta-button connect-wallet-button">
				Connect Wallet
			</button>
		</div>
  	);

	const renderInputForm = () => {
		
		// Check if the user is using the correct network, if not render the switch network button
		if (network !== 'Polygon Mumbai Testnet') {
			return (
				<div className="connect-wallet-container">
					<h2>Please switch to Polygon Mumbai Testnet</h2>
					{/* The button calls the switch network function */}
					<button className='cta-button mint-button' onClick={switchNetwork}>Click here to switch</button>
				</div>
			);
		}

		return (
			<div className="form-container">
				<div className="first-row">
					<input
						type="text"
						value={domain}
						placeholder="domain"
						onChange={e => setDomain(e.target.value)}
					/>
					<p className='tld'> {tld} </p>
				</div>
	
				<div className="button-container">
					{/* Call the mintDomain function when the button is clicked*/}
					<button className='cta-button mint-button' onClick={mintDomain}>
						Mint
					</button> 
				</div>
	
			</div>
		);
	}

	// Function runs when the page is loaded.
	useEffect(() => {
		checkIfWalletIsConnected();
	}, [])

  	return (
		<div className="App">
			<div className="container">

				<div className="header-container">
					<header>
						
						<div className="left">
							<p className="title">Polygon Name Service</p>
							<p className="subtitle">Your polygon name on the metaverse</p>
						</div>
						
						{/* Display Logo and wallet connection status*/}
						<div className="right">
							<img alt="Network logo" className="logo" src={ network.includes("Polygon") ? polygonLogo : ethLogo} />
							{ currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p> }
						</div>
					
					</header>
				</div>

				{/* Hide connect button if there is an account connected */}
				{!currentAccount && renderNotConnectedContainer()}

				{/* Render the input form if an account is connected */}
				{currentAccount && renderInputForm()}


        <div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`built by @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
};

export default App;
