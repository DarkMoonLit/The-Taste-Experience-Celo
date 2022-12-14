import React from "react";
import Cover from "./components/Cover";
import {Notification} from "./components/ui/Notifications";
import Wallet from "./components/wallet";
import {useBalance, useMinterContract} from "./hooks";


import Recipes from "./components/minter/nfts";
import {useContractKit} from "@celo-tools/use-contractkit";

import coverImg from "./assets/img/sandwich.jpg";
import "./App.css";


import {Container, Nav} from "react-bootstrap";

const App = function AppWrapper() {
    /*
    address : fetch the connected wallet address
    destroy: terminate connection to user wallet
    connect : connect to the celo blockchain
     */
    const {address, destroy, connect} = useContractKit();

    //  fetch user's celo balance using hook
    const {balance, getBalance} = useBalance();

    // initialize the NFT mint contract
    const minterContract = useMinterContract();

    return (
        <>
            <Notification/>

            {address? (
                <Container fluid="md">
                    <Nav className="justify-content-end pt-3 pb-5">
                        <Nav.Item>

                            {/*display user wallet*/}
                            <Wallet
                                address={address}
                                amount={balance.CELO}
                                symbol="CELO"
                                destroy={destroy}
                            />
                        </Nav.Item>
                    </Nav>
                    <main>

                        {/*list NFTs*/}
                        <Recipes
                            name="The Taste Experience"
                            updateBalance={getBalance}
                            minterContract={minterContract}
                        />
                    </main>
                </Container>
            ) : (
                //  if user wallet is not connected display cover page
                <Cover name="The Taste Experience" coverImg={coverImg} connect={connect}/>
            )}
        </>
    );
};

export default App;
