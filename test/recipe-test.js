const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("TheTasteExperience", function () {
  this.timeout(50000);

  let recipe;
  let owner;
  let acc1;
  let acc2;

  const price = ethers.utils.parseUnits("1");

  this.beforeEach(async function() {
      // This is executed before each test
      // Deploying the smart contract
      const Recipe = await ethers.getContractFactory("TheTasteExperience");
      [owner, acc1, acc2] = await ethers.getSigners();

      recipe = await Recipe.deploy();
  })

  it("Should set the right owner", async function () {
      expect(await recipe.owner()).to.equal(owner.address);
  });

  it("Should mint Recipe", async function() {
      expect(await recipe.balanceOf(acc1.address)).to.equal(0);
      
      const tokenURI = "https://example.com/1"
      const tx = await recipe.connect(acc1).createRecipe(tokenURI, price);
      await tx.wait();

      expect(await recipe.balanceOf(acc1.address)).to.equal(1);
  })

  it("Should set the correct tokenURI", async function() {
      const tokenURI_1 = "https://example.com/1"
      const tokenURI_2 = "https://example.com/2"

      const tx1 = await recipe.connect(acc1).createRecipe(tokenURI_1, price);
      await tx1.wait();
      const tx2 = await recipe.connect(acc2).createRecipe(tokenURI_2, price);
      await tx2.wait();

      expect(await recipe.tokenURI(0)).to.equal(tokenURI_1);
      expect(await recipe.tokenURI(1)).to.equal(tokenURI_2);
  })

  it("Should buy and rate Recipe", async function() {
    expect(await recipe.balanceOf(acc1.address)).to.equal(0);
    
    const tokenURI = "https://example.com/1"
    const tx = await recipe.connect(acc1).createRecipe(tokenURI, price);
    await tx.wait();

    expect(await recipe.balanceOf(acc1.address)).to.equal(1);

    const buyTx = await recipe.connect(acc2).buyRecipe(0, {value: price});
    await buyTx.wait();

    const rateTx = await recipe.connect(acc2).rateRecipe(0, 5, tokenURI);
    await rateTx.wait();

    const _recipe = await recipe.connect(acc1).getRecipe(0);
    
    expect(Number(_recipe[2])).to.equal(1);
    expect(Number(_recipe[6])).to.equal(5);
})

  
});
