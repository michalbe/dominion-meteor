Piazza = class Piazza extends Project {
    coin_cost() {
        return 5
    }

    start_turn_event(game, player_cards) {
        if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
            PlayerCardsModel.update(game._id, player_cards)

            if (_.isEmpty(player_cards.deck)) {
                DeckShuffler.shuffle(game, player_cards)
            }

            let top_card = player_cards.deck[0]
            game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(top_card)}`)

            if (_.includes(_.words(top_card.types), 'action')) {
                player_cards.hand.push(player_cards.deck.shift())
                let card_player = new CardPlayer(game, player_cards, top_card.name, true)
                card_player.play()
            } else {
                game.log.push(`&nbsp;&nbsp;putting it back on top of their deck`)
            }
        } else {
            game.log.push(`&nbsp;&nbsp;but there are no cards in deck to reveal`)
        }
    }
}
