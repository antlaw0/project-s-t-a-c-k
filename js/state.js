const initialState = {
    gameName: "New Adventure",

    grid: {
        width: 20,
        height: 20,
        tiles: {}
    },

    selectedTile: null,

    entities: {},
    players: {},
    decks: {},
    cards: {},
    encounters: {},

    ui: {
        selectedEntity: null,
        editMode: false
    }
};

const store = createStore(initialState);