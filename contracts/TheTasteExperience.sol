// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TheTasteExperience is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    struct Recipe {
        address payable owner;
        uint256 price;
        bool forSale;
    }

    mapping(uint256 => Recipe) private recipes;

    constructor() ERC721("The Taste Experience", "TTE") {}

    modifier onlyOwnerOfRecipe(uint tokenId){
        require(msg.sender == recipes[tokenId].owner);
        _;
    }

    function createRecipe(string memory uri, uint256 _price) public {
        require(_price >= 1 ether, "Recipes can't be listed as free");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        Recipe storage recipe = recipes[tokenId];
        recipe.owner = payable(msg.sender);
        recipe.price = _price;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // buys a recipe and unlock formula
    function buyRecipe(uint256 tokenId) public payable {
        require(recipes[tokenId].owner != msg.sender, "Not a customer");
        require(
            recipes[tokenId].price == msg.value,
            "Recipe price must be matched"
        );
        (bool success, ) = payable(recipes[tokenId].owner).call{
            value: msg.value
        }("");
        require(success, "Transfer failed");
        _transfer(recipes[tokenId].owner, msg.sender, tokenId);
        recipes[tokenId].owner = payable(msg.sender);
    }

    function changePrice(uint256 tokenId, uint _price) public onlyOwnerOfRecipe(tokenId){
        recipes[tokenId].price = _price;
    }

    function toggleForSale(uint256 tokenId) public onlyOwnerOfRecipe(tokenId){
        recipes[tokenId].forSale = !recipes[tokenId].forSale;
    }

    function getRecipe(uint tokenId)
        public
        view
        returns (
            address,
            uint,
            bool
        )
    {
        Recipe storage newRecipe = recipes[tokenId];
        return (
            newRecipe.owner,
            newRecipe.price,
            newRecipe.forSale
        );
    }


    function getRecipesLength() public view returns(uint){
        return (_tokenIdCounter.current());
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
