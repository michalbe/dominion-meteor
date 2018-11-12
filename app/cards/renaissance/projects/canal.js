Canal = class Canal extends Project {
    coin_cost() {
        return 7
    }

    start_turn_event(game, player_cards) {
        game.turn.coin_discount += 1
    }
}
