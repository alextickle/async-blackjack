const countAces = (cards) => {
    let count = 0;
    cards.forEach(card => {
        if (card.value === "ACE"){
            count++;
        }
    })
    return count;
}

let allCards = {
    "ACE": 1,
    "KING": 10,
    "QUEEN": 10,
    "JACK": 10,
    "10": 10
};
for(let i = 2; i <= 9; i++){
    allCards[i] = i;
}
const ALL_CARDS = Object.freeze(allCards);

const getMinimumHandValue = (cards) => {
    let total = 0;
    cards.forEach(card => {
        total += ALL_CARDS[card.value];
    })
    return total;
}

const getMaximumHandValue = (cards) => {
    const minimumHandValue = getMinimumHandValue(cards);
    const acesCount = countAces(cards);
    if (acesCount === 0){
        return minimumHandValue;
    } else {
        for (let i = acesCount; i >= 1; i--){
            const handValue = minimumHandValue + (10 * i);
            if (handValue <= 21){
                return handValue;
            }
        }
        return minimumHandValue;
    }
}

export {getMinimumHandValue, getMaximumHandValue};