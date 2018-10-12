Seer = class Seer extends Card {

    types() {
        return ['action']
    }

    coin_cost() {
        return 5
    }

    play(game, player_cards) {
        let card_drawer = new CardDrawer(game, player_cards)
        card_drawer.draw(1)

        let all = {};
        player_cards.in_play.concat(player_cards.discard).concat(player_cards.deck).concat(player_cards.hand).forEach((card) => {
            all[card.name] = all[card.name] || 0;
            all[card.name]++;
        })

        console.log('1', all)

        game.turn.actions += 1
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

        PlayerCardsModel.update(game._id, player_cards)
        GameModel.update(game._id, game)

        if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
            game.log.push(`&nbsp;&nbsp;but has no cards in deck`)
        } else {
            player_cards.revealed = _.take(player_cards.deck, 3)
            player_cards.deck = _.drop(player_cards.deck, 3)

            let revealed_card_count = _.size(player_cards.revealed)
            if (revealed_card_count < 3 && _.size(player_cards.discard) > 0) {
                DeckShuffler.shuffle(game, player_cards)
                player_cards.revealed = player_cards.revealed.concat(_.take(player_cards.deck, 3 - revealed_card_count))
                player_cards.deck = _.drop(player_cards.deck, 3 - revealed_card_count)
            }

            game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> looks at the top ${_.size(player_cards.revealed)} cards of their deck`)

            let revealed_costing_2_to_4 = _.filter(player_cards.revealed, function (card) {
                return CardCostComparer.coin_between(game, card, 2, 4)
            })

            player_cards.cards_to_return = _.filter(player_cards.revealed, function (card) {
                return !CardCostComparer.coin_between(game, card, 2, 4)
            })

            player_cards.hand = player_cards.hand.concat(revealed_costing_2_to_4)

            game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${_.size(revealed_costing_2_to_4)} cards in hand`)

            if (_.size(player_cards.cards_to_return) > 0) {
                let turn_event_id = TurnEventModel.insert({
                    game_id: game._id,
                    player_id: player_cards.player_id,
                    username: player_cards.username,
                    type: 'sort_cards',
                    instructions: 'Choose order to place cards on deck: (leftmost will be top card)',
                    cards: player_cards.cards_to_return
                })
                let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
                turn_event_processor.process(Seer.replace_cards)
            }
        }

        all = {};
        player_cards.in_play.concat(player_cards.discard).concat(player_cards.deck).concat(player_cards.hand).forEach((card) => {
            all[card.name] = all[card.name] || 0;
            all[card.name]++;
        })

        console.log('2', all)

    }

    static replace_cards(game, player_cards, ordered_card_names) {
        _.each(ordered_card_names.reverse(), function (card_name) {
            let revealed_card_index = _.findIndex(player_cards.cards_to_return, function (card) {
                return card.name === card_name
            })
            let revealed_card = player_cards.cards_to_return.splice(revealed_card_index, 1)[0]
            // console.log('returned', revealed_card);
            player_cards.deck.unshift(revealed_card)
        })

        console.log('deck 3', player_cards.deck.map(card => card.name))

        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places the remaining cards back on their deck`)
        player_cards.cards_to_return = []

        all = {};
        player_cards.in_play.concat(player_cards.discard).concat(player_cards.deck).concat(player_cards.hand).forEach((card) => {
            all[card.name] = all[card.name] || 0;
            all[card.name]++;
        })

        console.log('3', all)
    }

}
