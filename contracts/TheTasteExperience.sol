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
        address owner;
        uint256 price;
        uint256 sold;
        mapping(address => bool) canView;
        mapping(address => bool) canReview;
        Feedback[] feedbacks;
        uint ratingsCounter;
    }

    struct Feedback {
        address reviewer;
        uint rating;
        string review;
    }

    mapping(uint256 => Recipe) private recipes;

    constructor() ERC721("The Taste Experience", "TTE") {}

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
        require(!recipes[tokenId].canView[msg.sender], "Already bought recipe");
        require(
            recipes[tokenId].price == msg.value,
            "Recipe price must be matched"
        );
        recipes[tokenId].canView[msg.sender] = true;
        recipes[tokenId].canReview[msg.sender] = true;
        recipes[tokenId].sold++;
        (bool success, ) = payable(recipes[tokenId].owner).call{
            value: msg.value
        }("");
        require(success, "Transfer failed");
    }

    // rates a recipe
    function rateRecipe(
        uint tokenId,
        uint _rate,
        string memory _review
    ) public {
        require(recipes[tokenId].canReview[msg.sender], "Not a valid reviewer");
        require(_rate <= 5, "Rate must be between 0 and 5");
        recipes[tokenId].canReview[msg.sender] = false;
        recipes[tokenId].feedbacks.push(Feedback(msg.sender, _rate, _review));
        recipes[tokenId].ratingsCounter += _rate;
    }

    function getRecipe(uint tokenId)
        public
        view
        returns (
            address,
            uint,
            uint,
            bool,
            bool,
            Feedback[] memory,
            uint
        )
    {
        Recipe storage newRecipe = recipes[tokenId];
        return (
            newRecipe.owner,
            newRecipe.price,
            newRecipe.sold,
            newRecipe.canView[msg.sender],
            newRecipe.canReview[msg.sender],
            newRecipe.feedbacks,
            newRecipe.ratingsCounter
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
