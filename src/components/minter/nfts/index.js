
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import AddRecipe from "./AddRecipe";
import Recipe from "./Recipe";
import Loader from "../../ui/Loader";
import { Row } from "react-bootstrap";

import { NotificationSuccess, NotificationError } from "../../ui/Notifications";
import {
	getRecipes,buyRecipe,rateRecipe, createRecipe
} from "../../../utils/minter";
import { useContractKit } from "@celo-tools/use-contractkit";



const Recipes = ({minterContract }) => {
	const [recipes, setRecipes] = useState([]);
	const [loading, setLoading] = useState(false);
	const {performActions, address} = useContractKit();

	// function to get the list of recipes
	const getAssets = useCallback(async () => {
		try {
			setLoading(true);
			const recipes = await getRecipes(minterContract);
			if(!recipes) return
			setRecipes(recipes)
		} catch (e) {
			console.log({ e });
		} finally {
			setLoading(false);
		}
	}, [minterContract]);



	const addRecipe = async (data) => {
		try {
			setLoading(true);
			await createRecipe(minterContract, performActions, data);
			toast(<NotificationSuccess text="Recipe added successfully." />);
			getAssets();
		} catch (e) {
			console.log({ e });
			toast(<NotificationError text="Failed to create a recipe." />);
		} finally {
			setLoading(false);
		}
	};


	//  function to initiate transaction to buy recipe
	const buy = useCallback(async (index, price) => {
		try {
			setLoading(true);
			await buyRecipe(minterContract, performActions, index, price);
			toast(<NotificationSuccess text="Recipe bought successfully" />);
			getAssets();
		} catch (error) {
			toast(<NotificationError text="Failed to purchase recipe." />);
		} finally {
			setLoading(false);
		}
	}, [minterContract, getAssets, performActions]);

	//  function to initiate transaction to modify the formula of recipe
	const review = useCallback(async (index, review, rate) => {
		try {
			setLoading(true);
			await rateRecipe(minterContract, performActions, index, rate, review);
			getAssets();
			toast(
				<NotificationSuccess text="Recipe's formula modified successfully" />
			);
		} catch (error) {
			toast(<NotificationError text="Failed to modified recipe." />);
		} finally {
			setLoading(false);
		}
	}, [getAssets, minterContract, performActions]);


	useEffect(() => {
    try {
      if (address && minterContract) {
        getAssets();
      }
    } catch (error) {
      console.log({ error });
    }
  }, [minterContract, address, getAssets]);

	return (
		<>
			{!loading ? (
				<>
					<div className="d-flex justify-content-between align-items-center mb-4">
						<h1 className="fs-4 fw-bold mb-0">
							The Taste Experience
						</h1>
						<AddRecipe save={addRecipe} />
					</div>
					<Row
						xs={1}
						sm={2}
						lg={3}
						className="g-3  mb-5 g-xl-4 g-xxl-5"
					>
						{recipes.map((_recipe) => (
							<Recipe
								key={_recipe.index}
								recipe={{
									..._recipe,
								}}
								buy={buy}
								reviewRecipe={review}
								address={address}
							/>
						))}
					</Row>
				</>
			) : (
				<Loader />
			)}
		</>
	);
};

export default Recipes;