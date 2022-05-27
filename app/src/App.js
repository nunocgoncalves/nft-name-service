// Import Dependencies
import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";

// Import Utilities
import { networks } from './utils/networks';
import contractAbi from './utils/contractABI.json';

// Import Assets
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';

// Define constants
const CONTRACT_ADDRESS = '0x2eBb76e8245B921b74da8c42fACC305F6649F237';
const tld = '.delta';
const TWITTER_HANDLE = 'nunomiguelcg';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

// 
const App = () => {

	// State variable that stores the network
	const [network, setNetwork] = useState('');

	// State variable that stores the user's public wallet address
	const [currentAccount, setCurrentAccount] = useState('');

	// State variables for the domain minting functions
	const [domain, setDomain] = useState('');
	const [record, setRecord] = useState('');
	const [editing, setEditing] = useState(false);
	const [loading, setLoading] = useState(false);

	// State variables to fetch mints
	const [mints, setMints] = useState([]);

	// When page is loaded, check if wallet is connected
	useEffect(() => {
		checkIfWalletIsConnected();
	}, [])
	
	// Re run every time the currentAccount or network are changed
	useEffect(() => {
		
		if (network === 'Polygon Mumbai Testnet') {
			fetchMints();
		}

	}, 
	
	[currentAccount, network]);
	
	// This componnent allows the Dapp to connect to MetaMask
	// Other wallets will be supported in the future
	const connectWallet = async () => {
		
		try {
			
			// Get access to the ethereum object
			const { ethereum } = window;

			if (!ethereum) {
				alert("Get MetaMask -> https://metamask.io/");
				return;
			}

			// Request access to the account
			const accounts = await ethereum.request({ method: "eth_requestAccounts" });
		
			// Shows the connected account public address
			console.log("Connected", accounts[0]);
			setCurrentAccount(accounts[0]);
		
		} catch (error) {
			console.log(error)
		}
	
	};
	

	// This component checks if the wallet is connected to the Dapp, takes cares of the account authorization and connects the account to the right network
	const checkIfWalletIsConnected = async () => {
		
		// Get access to the ethereum object
		const { ethereum } = window;

		// If there is no wallet connected, warn user to connect the wallet
		if (!ethereum) {
			console.log('Make sure you have metamask!');
			return;
		
		} else {
			console.log('We have the ethereum object', ethereum);
		}
		
		// Check for authorization to access the user's wallet
		const accounts = await ethereum.request({ method: 'eth_accounts' });

		// Checks for authorized accounts
		// If an authorized account is found, connect to the first one
		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log('Found an authorized account:', account);
			setCurrentAccount(account);
		
		} else {
			console.log('No authorized account found');
		}
		
		// Fetch the network chain ID
		const chainId = await ethereum.request({ method: 'eth_chainId' });
		setNetwork(networks[chainId]);

		// Change to the correct network
		ethereum.on('chainChanged', handleChainChanged);
		
		// Reload page after the network is changed
		function handleChainChanged(_chainId) {
			window.location.reload();
		}

	};

	// This component switches the network in MetaMask
	const switchNetwork = async () => {
		
		// If the user has MetaMask installed
		if (window.ethereum) {
			
			// Try to switch chain
			try {
				// Switch Network
				await window.ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: '0x13881' }], // The hexadecimal network ids can be found on /utils/networks.js
				});
			
			} catch (error) {
				
				// If the chain is not on Metamask
				if (error.code === 4902) {
					
					// Try to add the chain
					try {
						await window.ethereum.request({
							method: 'wallet_addEthereumChain',
							params: [
								{	
									chainId: '0x13881',
									chainName: 'Polygon Mumbai Testnet',
									rpcUrls: ['https://rpc-mumbai.matic.today'],
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
		
		// Else, alert user to install MetaMask
		} else {
			alert('MetaMask is not installed. Install MetaMask: https://metamask.io/download.html');
		}
	
	};

	// This component mints the domain for the user
	const mintDomain = async () => {

		// If the domain is empty, don't run
		if (!domain) { return }
		
		// If the domain is too short, alert the user
		if (domain.length < 2) {
		  alert('The domain must be at least 3 characters long!');
		  return;
		}

		// If the domain is too long, alert the user
		if (domain.length > 32) {
			alert('The domain is too long!');
			return;
		}

		// Calculate domain price based on the length
		const price = domain.length === 2 ? '0.005' : domain.length <= 4 ? '0.003' : '0.001';
		
		// Mint the domain
		console.log("Minting domain", domain, "with price", price);
		
		// Send request to the wallet
		try {

			const { ethereum } = window;
			
			if (ethereum) {
			
				// Connect to provider
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
			
				// Connect to contract
				const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);
				
				console.log("Pop wallet to pay")
				
				// Parse values for the transaction
				let tx = await contract.register(domain, {value: ethers.utils.parseEther(price)});
				
				// Wait for the transaction to be validated
				const receipt = await tx.wait();
	  
				// Check if the transaction was successfully completed
				if (receipt.status === 1) {
				
					console.log("Domain minted! https://mumbai.polygonscan.com/tx/"+tx.hash);
			  
			  		// DEBUG! Consider moving the setRecord function up
					// Set the record for the domain
			  		tx = await contract.setRecord(domain, record);
			  		await tx.wait();
	  
			  		console.log("Record set! https://mumbai.polygonscan.com/tx/"+tx.hash);
				
			  	// Call fetchMints after 2 seconds
			  	setTimeout(() => {
					fetchMints();
			  	}, 2000);
			
				// Update state variables
				setDomain('');
				setRecord('');
			
				// If transaction fails, alert user
				} else {
			  		alert("Transaction failed! Please try again");
				}
			
			}

		} catch(error) {
			console.log(error);
		}

	};

	// This component allows the user to updated the domain
	const updateDomain = async () => {

		if (!record || !domain) { return }

			// Update setLoading variable
			setLoading(true);
		
			console.log("Updating domain", domain, "with record", record);
			
			try {
				
				// Get access to the ethereum object
				const { ethereum } = window;
		  		
				if (ethereum) {

					// Connect to provider
					const provider = new ethers.providers.Web3Provider(ethereum);
					const signer = provider.getSigner();

					// Connect to contract
					const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);
	  
					// Update record
					let tx = await contract.setRecord(domain, record);
					await tx.wait();
					console.log("Record set https://mumbai.polygonscan.com/tx/"+tx.hash);
	  
					// Update state variables
					fetchMints();
					setRecord('');
					setDomain('');
		  	
				}

			} catch(error) {
				console.log(error);
			}
			
			// Update setLoading variable
			setLoading(false);
	
	};

	// This component fetches mints from the contract to display them on the frontend
	const fetchMints = async () => {

		try {

			// Get access to the ethereum object
			const { ethereum } = window;
		  	
			if (ethereum) {
				
				// Connect to provider
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				
				// Connect to contract
				const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);
			  
				// Fetch all the domain names from the contract
				const names = await contract.getAllNames();
			  
			// Get the record and address of each mint
			const mintRecords = await Promise.all(names.map(async (name) => {
				
				const mintRecord = await contract.records(name);
				const owner = await contract.domains(name);
			
				return {
			  		id: names.indexOf(name),
			  		name: name,
			  		record: mintRecord,
			  		owner: owner,
				};

		  	}));
			
			console.log("Mints fetched", mintRecords);
		  	
			// Update setMints variable
			setMints(mintRecords);
		  	
			}
		
		} catch(error){
		  console.log(error);
		}

	};

	// Render Methods
	const renderNotConnectedContainer = () => (
		
		<div className="connect-wallet-container">
		
			{/* Calls the function once the button is clicked */}
			<button onClick={connectWallet} className="cta-button connect-wallet-button">
				Connect Wallet
			</button>
		
		</div>
  	
	);

	// Renders the input field
	const renderInputForm = () =>{

		if (network !== 'Polygon Mumbai Testnet') {
			
			return (
				<div className="connect-wallet-container">
			  		<p>Please connect to Polygon Mumbai Testnet</p>
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
						placeholder='domain'
						onChange={e => setDomain(e.target.value)}
			  		/>
			  		<p className='tld'> {tld} </p>
				</div>
	
				<input
					type="text"
			  		value={record}
			  		placeholder='record'
			  		onChange={e => setRecord(e.target.value)}
				/>
			
				{/* If editing is true, return the "Set record" and "Cancel" button */}
				{editing ? (
					<div className="button-container">
						<button className='cta-button mint-button' disabled={loading} onClick={updateDomain}>
							Set record
				  		</button>  
				  		<button className='cta-button mint-button' onClick={() => {setEditing(false)}}>
							Cancel
				  		</button>  
					</div>
				) : (
					// If editing is false, return Mint button
					<button className='cta-button mint-button' disabled={loading} onClick={mintDomain}>
						Mint
					</button>  
				)}

		  	</div>
		
		);
	};

	// This component renders the fetched mints
	const renderMints = () => {
		
		if (currentAccount && mints.length > 0) {
			
			return (
			
				<div className="mint-container">
			  		<p className="subtitle"> Minted domains</p>
			  	<div className="mint-list">
				
				{ mints.map((mint, index) => {
				  	
					return (
					
						<div className="mint-item" key={index}>
						<div className='mint-row'>
							<a className="link" href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${mint.id}`} target="_blank" rel="noopener noreferrer">
						  		<p className="underlined">{' '}{mint.name}{tld}{' '}</p>
							</a>
						
						{/* If the mint owner is currentAccount, render edit button*/}
						{ mint.owner.toLowerCase() === currentAccount.toLowerCase() ?
						
							<button className="edit-button" onClick={() => editRecord(mint.name)}>
								<img className="edit-icon" src="https://img.icons8.com/metro/26/000000/pencil.png" alt="Edit button" />
						  	</button>
						: null
						
						}
					  	
						</div>
							<p> {mint.record} </p>
			  			</div>
					
					)
			  	
				})}

				</div>
		  		</div>
			
			);
		}

	};
	  
	// This component is responsible for the edit mode
	const editRecord = (name) => {
		
		console.log("Editing record for", name);
		
		// Update state variables
		setEditing(true);
		setDomain(name);
	}

  	return (

		<div className="App">
			<div className="container">

				<div className="header-container">
					
					<header>
						
						<div className="left">
							<p className="title">Delta Name Service</p>
							<p className="subtitle">Get access to Delta by getting your delta name as an NFT!</p>
						</div>
						
						{/* network logo and wallet connection status*/}
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

				{/* Render minted domains */}
				{mints && renderMints()}


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