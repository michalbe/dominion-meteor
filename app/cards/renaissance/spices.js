Spices = class Spices extends Card {

    types() {
        return ['treasure']
    }

    coin_cost() {
        return 5
    }

    play(game, player_cards) {
        game.turn.buys += 1
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy`)
        CoinGainer.gain(game, player_cards, 2)
    }

    gain_event(buyer) {
        let player_cards = buyer.player_cards
        let game = buyer.game
        if (game.turn.possessed) {
            possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
            possessing_player_cards.coin_tokens += 2
            game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> takes 2 coin tokens`)
            PlayerCardsModel.update(game._id, possessing_player_cards)
        } else {
            player_cards.coin_tokens += 2
            game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes 2 coin tokens`)
        }
    }
}
