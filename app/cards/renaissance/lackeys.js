Lackeys = class Lackeys extends Card {

    types() {
        return ['action']
    }

    coin_cost() {
        return 2
    }

    play(game, player_cards) {
        let card_drawer = new CardDrawer(game, player_cards)
        card_drawer.draw(2)
    }

    gain_event(player) {
        if (player.game.turn.possessed) {
            possessing_player_cards = PlayerCardsModel.findOne(player.game._id, player.game.turn.possessed._id)
            possessing_player_cards.villagers += 2
            player.game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> takes 2 villagers`)
            PlayerCardsModel.update(player.game._id, possessing_player_cards)
        } else {
            player.player_cards.villagers += 2
            player.game.log.push(`&nbsp;&nbsp;<strong>${player.player_cards.username}</strong> takes 2 villagers`)
        }
    }

}
