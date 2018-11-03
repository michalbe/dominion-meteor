Barracks = class Barracks extends Project {
    coin_cost() {
        return 6
    }

    start_turn_event(game, player_cards) {
        game.turn.actions += 1
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)
    }
}
