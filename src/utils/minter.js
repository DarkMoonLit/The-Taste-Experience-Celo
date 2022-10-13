import { create as ipfsHttpClient } from "ipfs-http-client";
import axios from "axios";
import CryptoJS from "crypto-js";
import BigNumber from "bignumber.js";
// initialize IPFS
const auth =
	"Basic " +
	Buffer.from(
		process.env.REACT_APP_PROJECT_ID +
			":" +
			process.env.REACT_APP_PROJECT_SECRET
	).toString("base64");

const client = ipfsHttpClient({
	host: "ipfs.infura.io",
	port: 5001,
	protocol: "https",
	apiPath: "/api/v0",
	headers: {
		authorization: auth,
	},
});

// mint an NFT
export const createRecipe = async (
	minterContract,
	performActions,
	{ name, description, image, formula, price }
) => {
	await performActions(async (kit) => {
		if (!name || !description || !image || !formula || !price) return;
		const { defaultAccount } = kit;
		try {

			const passphrase = process.env.REACT_APP_PASSPHRASE;
			// encrypt formula using passphrase
			const encryptFormula = CryptoJS.AES.encrypt(
				formula,
				passphrase
			).toString();
			// convert NFT metadata to JSON format
			const data = JSON.stringify({
				name,
				description,
				image,
				encryptFormula,
			});

			// save NFT metadata to IPFS
			const added = await client.add(data);

			// IPFS url for uploaded metadata
			const url = `https://tasteexperience.infura-ipfs.io/ipfs/${added.path}`;

			// mint the NFT and save the IPFS url to the blockchain
			let transaction = await minterContract.methods
				.createRecipe(url, price)
				.send({ from: defaultAccount });

			return transaction;
		} catch (error) {
			console.log("Error uploading file: ", error);
		}
	});
};

// function to upload a file to IPFS
export const uploadToIpfs = async (e) => {
	const file = e.target.files[0];
	if (!file) return;
	try {
		const added = await client.add(file, {
			progress: (prog) => console.log(`received: ${prog}`),
		});
		return `https://tasteexperience.infura-ipfs.io/ipfs/${added.path}`;
	} catch (error) {
		console.log("Error uploading file: ", error);
	}
};

// fetch all NFTs on the smart contract
export const getRecipes = async (minterContract) => {
	try {
		const nfts = [];
		const nftsLength = await minterContract.methods
			.getRecipesLength()
			.call();
		for (let i = 0; i < Number(nftsLength); i++) {
			const nft = new Promise(async (resolve) => {
				const res = await minterContract.methods.tokenURI(i).call();
				const recipeData = await minterContract.methods
					.getRecipe(i)
					.call();
				const meta = await fetchNftMeta(res);
				const passphrase = process.env.REACT_APP_PASSPHRASE;
				// decrypt formula using passphrase
				const bytes = CryptoJS.AES.decrypt(
					meta.data.encryptFormula,
					passphrase
				);
				// convert bytes to human readable format
				const formula = bytes.toString(CryptoJS.enc.Utf8);
				resolve({
					owner: recipeData[0],
					index: i,
					name: meta.data.name,
					image: meta.data.image,
					description: meta.data.description,
					formula,
					price: new BigNumber(recipeData[1]),
					sold: recipeData[2],
					canView: recipeData[3],
					canReview: recipeData[4],
					feedbacks: recipeData[5],
					ratingsCounter: recipeData[6],
				});
			});
			nfts.push(nft);
		}
		return Promise.all(nfts);
	} catch (e) {
		console.log({ e });
	}
};

// get the metedata for an NFT from IPFS
export const fetchNftMeta = async (ipfsUrl) => {
	try {
		if (!ipfsUrl) return null;
		const meta = await axios.get(ipfsUrl);
		return meta;
	} catch (e) {
		console.log({ e });
	}
};

// get the address that deployed the NFT contract
export const fetchNftContractOwner = async (minterContract) => {
	try {
		let owner = await minterContract.methods.owner().call();
		return owner;
	} catch (e) {
		console.log({ e });
	}
};

export const buyRecipe = async (
	minterContract,
	performActions,
	index,
	price
) => {
	try {
		await performActions(async (kit) => {
			const { defaultAccount } = kit;
			await minterContract.methods
				.buyRecipe(index)
				.send({ from: defaultAccount, value: price });
		});
	} catch (e) {
		console.error({ e });
	}
};

export const rateRecipe = async (
	minterContract,
	performActions,
	index,
	rate,
	review
) => {
	try {
		await performActions(async (kit) => {
			const { defaultAccount } = kit;
			await minterContract.methods
				.rateRecipe(index, rate, review)
				.send({ from: defaultAccount });
		});
	} catch (e) {
		console.error({ e });
	}
};
