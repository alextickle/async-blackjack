import React, {useState, useEffect, useRef} from "react";
import DeckService from "../service/DeckService";
import {getMinimumHandValue, getMaximumHandValue} from "../util/CardsUtil";
import Hand from "./Hand";

function BlackJack() {

    const [playerCards, setPlayerCards] = useState([]);
    const [isPlayerFinished, setIsPlayerFinished] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [deckId, setDeckId] = useState(null);
    const [message, setMessage] = useState(null);

    const dealerCards = useRef([]);
    const isDealerBusted = useRef(false);

    useEffect(() => {
        DeckService.getNewDeck()
            .then(deckId => DeckService.shuffleDeck(deckId))
            .then(deckId => {
                setDeckId(deckId);
                return dealCards(deckId)
            })
    }, []);

    const handleNewGame = () => {
        DeckService.getNewDeck()
            .then(deckId => DeckService.shuffleDeck(deckId))
            .then(deckId => {
                setDeckId(deckId);
                dealerCards.current = [];
                setPlayerCards([]);
                setIsGameOver(false);
                setIsPlayerFinished(false);
                isDealerBusted.current = false;
                setMessage(null);
                return dealCards(deckId);
            })
    }

    const handlePlayerDraw = () => {
        DeckService.drawCards(deckId, 1)
            .then(cards => {
                const newHand = playerCards.slice();
                newHand.push(cards[0]);
                setPlayerCards(newHand);
                if (getMinimumHandValue(newHand) > 21){
                    setIsPlayerFinished(true);
                    setMessage("Players busts, Dealer wins!");
                    setIsGameOver(true);
                }
            })
    }

    const handleStay = () => {
        setMessage("Dealer drawing...");
        startDealerTurn();
    }

    const determineWinner = () => {
        let message;
        const playerHandFinalValue = getMaximumHandValue(playerCards);
        const dealerHandFinalValue = getMaximumHandValue(dealerCards.current);
        if (dealerHandFinalValue > playerHandFinalValue){
            message = `Dealer wins, ${dealerHandFinalValue} > ${playerHandFinalValue}`;
        } else if (dealerHandFinalValue === playerHandFinalValue){
            message = `Tie, ${dealerHandFinalValue} = ${playerHandFinalValue}`;
        } else {
            message = `Player wins, ${playerHandFinalValue} > ${dealerHandFinalValue}`;
        }
        setMessage(message);
        setIsGameOver(true);
    }

    const startDealerTurn = async () => {
        let isDealerFinished = false;
        while (!isDealerFinished){
            isDealerFinished = await makeDecisionForDealer();
        }
        if (!isDealerBusted.current){
            determineWinner();
        }
    }

    const makeDecisionForDealer = async () => {
        if (getMinimumHandValue(dealerCards.current) > 21){
            setMessage("Dealer busts, player wins");
            isDealerBusted.current = true;
            setIsGameOver(true);
            return Promise.resolve(true);
        } else {
            const maximumHandValue = getMaximumHandValue(dealerCards.current);
            if (maximumHandValue >= 17){
                return Promise.resolve(true);
            } else {
                return drawForDealer();
            }
        }
    }

    const drawForDealer = () => {
        return DeckService.drawCards(deckId, 1)
            .then(cards => {
                dealerCards.current.push(cards[0]);
                return Promise.resolve(false);
            })
    }

    const dealCards = (deckId) => {
        return DeckService.drawCards(deckId, 3)
            .then(cards => {
                const newPlayerHand = [];
                newPlayerHand.push(cards[0]);
                dealerCards.current.push(cards[1]);
                newPlayerHand.push(cards[2]);
                setPlayerCards(newPlayerHand);
            })
    }

    return (
        <div className="row">
            <div className="col-sm-5">
                <Hand title="PLAYER" cards={playerCards}/>
            </div>
            <div className="col-sm-2" style={{paddingTop: 100}}>
                {!isPlayerFinished &&
                    <div className="row">
                        <div className="col-sm-3 offset-sm-2">
                            <button onClick={handlePlayerDraw}>Hit</button>
                        </div>
                        <div className="col-sm-3 offset-sm-2">
                            <button onClick={handleStay}>Stay</button>
                        </div>
                    </div>
                }
                {message &&
                    <div>{message}</div>
                }
                {isGameOver &&
                    <button onClick={handleNewGame}>New Game</button>
                }
            </div>
            <div className="col-sm-5">
                <Hand title="DEALER" cards={dealerCards.current}/>
            </div>
        </div>
    );
}

export default BlackJack;