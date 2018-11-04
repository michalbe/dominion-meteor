CropRotation = class CropRotation extends Project {
    coin_cost() {
        return 1
    }

    start_turn_event(game, player_cards) {
        let victory_cards = _.filter(player_cards.hand, function (card) {
            return _.includes(_.words(card.types), 'victory')
        })
        if (_.size(victory_cards) > 0) {
            let turn_event_id = TurnEventModel.insert({
                game_id: game._id,
                player_id: player_cards.player_id,
                username: player_cards.username,
                type: 'choose_cards',
                player_cards: true,
                instructions: 'Choose a victory card to discard (or none to skip):',
                cards: victory_cards,
                minimum: 0,
                maximum: 1
            })
            let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
            turn_event_processor.process(CropRotation.discard_cards)
        } else {
            game.log.push(`&nbsp;&nbsp;but does not discard a victory card`)
        }
    }

    static discard_cards(game, player_cards, selected_cards) {
        if (_.size(selected_cards) === 0) {
            game.log.push(`&nbsp;&nbsp;but does not discard a victory card`)
        } else {
            let card_discarder = new CardDiscarder(game, player_cards, 'hand', _.map(selected_cards, 'name'))
            card_discarder.discard()

            let card_drawer = new CardDrawer(game, player_cards)
            card_drawer.draw(2)
        }
    }
}
