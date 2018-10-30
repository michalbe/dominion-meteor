Exploration = class Exploration extends Project {
    coin_cost() {
        return 4
    }

    end_buy_event(game, player_cards) {
        if (game.turn.possessed) {
            possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
            possessing_player_cards.villagers += 1
            possessing_player_cards.coin_tokens += 1
            game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> takes a villager and a coin token`)
            PlayerCardsModel.update(game._id, possessing_player_cards)
        } else {
            player_cards.villagers += 1
            player_cards.coin_tokens += 1
            game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes a villager and a coin token`)
        }
    }
}
