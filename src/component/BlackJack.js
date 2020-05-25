import React, {Component} from "react";
import DeckService from "../service/DeckService";
import {getMinimumHandValue, getMaximumHandValue} from "../util/CardsUtil";
import Hand from "./Hand";

class BlackJack extends Component {

    constructor(){
        super();
        this.state = {
            playerCards: [],
            dealerCards: [],
            isDealerBusted: false,
            isPlayerFinished: false,
            gameOver: false
        };

        this.startDealerTurn = this.startDealerTurn.bind(this);
        this.makeDecisionForDealer = this.makeDecisionForDealer.bind(this);
    }

    componentDidMount(){
        DeckService.getNewDeck()
            .then(deckId => DeckService.shuffleDeck(deckId))
            .then(deckId => {
                this.setState({deckId});
                return this.dealCards(deckId)
            })
    }

    handleNewGame = () => {
        DeckService.getNewDeck()
            .then(deckId => DeckService.shuffleDeck(deckId))
            .then(deckId => {
                this.setState({
                    playerCards: [],
                    dealerCards: [],
                    isPlayerFinished: false,
                    gameOver: false,
                    message: null,
                    deckId
                });
                return this.dealCards(deckId);
            })
    }

    handlePlayerDraw = () => {
        const {deckId, playerCards} = this.state;
        DeckService.drawCards(deckId, 1)
            .then(data => {
                playerCards.push(data.cards[0]);
                const newState = {playerCards}
                if (getMinimumHandValue(playerCards) > 21){
                    newState.isPlayerFinished = true;
                    newState.message = "Players busts, Dealer wins!"
                    newState.gameOver = true;
                }
                this.setState(newState);
            })
    }

    handleStay = () => {
        this.setState({isPlayerFinished: true, message: "Dealer drawing..."});
        this.startDealerTurn();
    }

    async startDealerTurn() {
        let isDealerFinished = false;
        while (!isDealerFinished){
            isDealerFinished = await this.makeDecisionForDealer();
        }
        const {isDealerBusted} = this.state;
        if (!isDealerBusted){
            this.determineWinner();
        }
    }

    determineWinner = () => {
        const {dealerCards, playerCards} = this.state;
        let message;
        const playerHandFinalValue = getMaximumHandValue(playerCards);
        const dealerHandFinalValue = getMaximumHandValue(dealerCards);
        if (dealerHandFinalValue > playerHandFinalValue){
            message = `Dealer wins, ${dealerHandFinalValue} >= ${playerHandFinalValue}`;
        } else if (dealerHandFinalValue === playerHandFinalValue){
            message = `Tie, ${dealerHandFinalValue} = ${playerHandFinalValue}`;
        } else {
            message = `Player wins, ${playerHandFinalValue} >= ${dealerHandFinalValue}`;
        }
        this.setState({message, gameOver: true});
    }

    drawForDealer = () => {
        const {deckId, dealerCards} = this.state;
        return DeckService.drawCards(deckId, 1)
            .then(data => {
                dealerCards.push(data.cards[0]);
                this.setState({dealerCards});
                return Promise.resolve(false);
            })
    }

    async makeDecisionForDealer() {
        const {dealerCards} = this.state;
        if (getMinimumHandValue(dealerCards) > 21){
            this.setState({
                message: "Dealer busts, player wins",
                isDealerBusted: true,
                gameOver: true
            }, () => Promise.resolve(true));
        } else {
            const maximumHandValue = getMaximumHandValue(dealerCards);
            if (maximumHandValue >= 17){
                this.setState({dealerHandFinalValue: maximumHandValue});
                return Promise.resolve(true);
            } else {
                return this.drawForDealer();
            }
        }
    }

    dealCards = (deckId) => {
        return DeckService.drawCards(deckId, 4)
            .then(data => {
                const playerCards = [];
                const dealerCards = [];
                playerCards.push(data.cards[0]);
                dealerCards.push(data.cards[1]);
                playerCards.push(data.cards[2]);
                dealerCards.push(data.cards[3]);
                this.setState({playerCards, dealerCards});
            })
    }

    render(){
        const {playerCards, dealerCards, isPlayerFinished, gameOver, message} = this.state;
        const dealerCardsToRender = (isPlayerFinished || dealerCards.length === 0) ? dealerCards : dealerCards.slice(0,1);

        return (
            <div className="row">
                <div className="col-sm-5">
                    <Hand title="PLAYER" cards={playerCards}/>
                </div>
                <div className="col-sm-2" style={{paddingTop: 100}}>
                    {!isPlayerFinished &&
                        <div className="row">
                            <div className="col-sm-3 offset-sm-2">
                                <button onClick={this.handlePlayerDraw}>Hit</button>
                            </div>
                            <div className="col-sm-3 offset-sm-2">
                                <button onClick={this.handleStay}>Stay</button>
                            </div>
                        </div>
                    }
                    {message &&
                        <div>{message}</div>
                    }
                    {gameOver &&
                        <button onClick={this.handleNewGame}>New Game</button>
                    }
                </div>
                <div className="col-sm-5">
                    <Hand title="DEALER" cards={dealerCardsToRender}/>
                </div>
            </div>
        );
    }

}

export default BlackJack;