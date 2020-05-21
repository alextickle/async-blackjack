import React, {Component} from "react";
import DeckService from "../service/DeckService";
import CardsUtil from "../util/CardsUtil";

class BlackJack extends Component {

    constructor(){
        super();
        this.state = {
            playerCards: [],
            dealerCards: [],
            playerBusted: false,
            dealerBusted: false,
            playerFinished: false,
            dealerHandFinalValue: null
        };

        this.dealerPlay = this.dealerPlay.bind(this);
        this.dealerTurn = this.dealerTurn.bind(this);

    }

    componentDidMount(){
        DeckService.getNewDeck()
            .then(deckId => DeckService.shuffleDeck(deckId))
            .then(deckId => {
                this.setState({deckId});
                return this.dealCards(deckId)
            })
    }

    handlePlayerDraw = () => {
        const {deckId, playerCards} = this.state;
        DeckService.drawCards(deckId, 1)
            .then(data => {
                playerCards.push(data.cards[0]);
                const newState = {playerCards}
                if (CardsUtil.getMinimumHandValue(playerCards) > 21){
                    newState.playerBusted = true;
                }
                this.setState(newState);
            })
    }



    handleStay = () => {
        this.setState({playerFinished: true});
        this.dealerPlay();
    }

    async dealerPlay() {
        let dealerFinished = false;
        while (!dealerFinished){
            dealerFinished = await this.dealerTurn();
        }
    }

    determineWinner = () => {
        const {dealerHandFinalValue, playerCards} = this.state;
        // TODO
    }

    dealerDraw = () => {
        const {deckId, dealerCards} = this.state;
        return DeckService.drawCards(deckId, 1)
            .then(data => {
                dealerCards.push(data.cards[0]);
                this.setState({dealerCards});
                return Promise.resolve(false);
            })
    }

    async dealerTurn() {
        const {dealerCards} = this.state;
        if (CardsUtil.getMinimumHandValue(dealerCards) > 21){
            this.setState({dealerBusted: true})
            return Promise.resolve(true);
        } else {
            const maximumHandValue = CardsUtil.getMaximumHandValue(dealerCards);
            if (maximumHandValue >= 17){
                this.setState({dealerHandFinalValue: maximumHandValue});
                return Promise.resolve(true);
            } else {
                return this.dealerDraw();
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
        const {playerCards, dealerCards, playerBusted, dealerBusted, playerFinished} = this.state;
        console.log(this.state);
        const dealerCardsToRender = (playerFinished || dealerCards.length === 0) ? dealerCards : dealerCards.slice(0,1);

        return (
            <div>
                PLAYER
                <div>
                    {playerCards.length !== 0 && playerCards.map((card, i) => {
                        return <img style={{size: "50%"}} key={i} src={card.image}/>;
                    })}
                </div>
                {!playerFinished &&
                    <div>
                        <button onClick={this.handlePlayerDraw}>Hit</button>
                        <button onClick={this.handleStay}>Stay</button>
                    </div>
                }
                <br/>
                DEALER
                <div>
                    {dealerCardsToRender.map((card, i) => {
                        return <img style={{size: "50%"}} key={i} src={card.image}/>;
                    })}
                </div>
                {playerBusted && <div style={{color: 'red'}}>PLAYER BUSTED</div>}
                {dealerBusted && <div style={{color: 'red'}}>DEALER BUSTED</div>}
            </div>
        );
    }

}

export default BlackJack;