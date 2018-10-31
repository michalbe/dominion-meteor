Fair = class Fair extends Project {
    coin_cost() {
        return 4
    }

    start_turn_event(game, player_cards) {
        game.turn.buys += 1
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy`)
    }
}
