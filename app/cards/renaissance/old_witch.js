OldWitch = class OldWitch extends Card {

    types() {
        return ['action', 'attack']
    }

    coin_cost() {
        return 5
    }

    play(game, player_cards) {
        let card_drawer = new CardDrawer(game, player_cards)
        card_drawer.draw(3)

        let player_attacker = new PlayerAttacker(game, this)
        player_attacker.attack(player_cards)
    }

    attack(game, player_cards) {
        let card_gainer = new CardGainer(game, player_cards, 'discard', 'Curse')
        card_gainer.gain_game_card()

        let curese_in_hand = _.find(player_cards.hand, function (card) {
            return card.name === 'Curse'
        })

        if (curese_in_hand) {
            let turn_event_id = TurnEventModel.insert({
                game_id: game._id,
                player_id: player_cards.player_id,
                username: player_cards.username,
                type: 'choose_yes_no',
                instructions: `Trash ${CardView.render(curese_in_hand)}?`,
                minimum: 1,
                maximum: 1
            })
            let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
            turn_event_processor.process(OldWitch.trash_curse_from_hand)
        }
    }

    static trash_curse_from_hand(game, player_cards, response) {
        if (response === 'yes') {
            let card_trasher = new CardTrasher(game, player_cards, 'hand', 'Curse')
            card_trasher.trash()
        }
    }
}
