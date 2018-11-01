Silos = class Silos extends Project {
    coin_cost() {
        return 4
    }

    start_turn_event(game, player_cards) {
        let coppers = _.filter(player_cards.hand, function (card) {
            return card.name === 'Copper'
        })

        if (_.size(coppers) > 0) {
            let turn_event_id = TurnEventModel.insert({
                game_id: game._id,
                player_id: player_cards.player_id,
                username: player_cards.username,
                type: 'choose_cards',
                player_cards: true,
                instructions: 'Choose any number of coppers to discard:',
                cards: coppers,
                minimum: 0,
                maximum: 0
            })
            let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
            turn_event_processor.process(Silos.discard_cards)
        } else {
            game.log.push(`&nbsp;&nbsp;but does not discard any coppers`)
        }
    }

    static discard_cards(game, player_cards, selected_cards) {
        if (_.size(selected_cards) === 0) {
            game.log.push(`&nbsp;&nbsp;but does not discard any coppers`)
        } else {
            let card_discarder = new CardDiscarder(game, player_cards, 'hand', _.map(selected_cards, 'name'))
            card_discarder.discard()

            let card_drawer = new CardDrawer(game, player_cards)
            card_drawer.draw(_.size(selected_cards))
        }
    }
}
