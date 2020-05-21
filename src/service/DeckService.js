const SERVICE = "https://deckofcardsapi.com/api/deck";

const drawCards = (deckId, numberOfCards = 1) => {
    return fetch(SERVICE + "/" + deckId + "/draw?" + "count=" + numberOfCards)
        .then(response => response.json())
}

const getNewDeck = () => {
    return fetch(SERVICE + "/new")
        .then(response => response.json())
        .then(data => data.deck_id)
}

const shuffleDeck = (deckId) => {
    return fetch(SERVICE + "/" + deckId + "/shuffle")
        .then(response => response.json())
        .then(data => data.deck_id)
}

export default {drawCards, getNewDeck, shuffleDeck};