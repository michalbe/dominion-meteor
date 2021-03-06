Shepherd = class Shepherd extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)
    GameModel.update(game._id, game)

    let victory_cards = _.filter(player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'victory')
    })
    if (_.size(victory_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose any number of victory cards to discard:',
        cards: victory_cards,
        minimum: 0,
        maximum: 0
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Shepherd.discard_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not discard any victory cards`)
    }
  }

  static discard_cards(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;but does not discard any victory cards`)
    } else {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand', _.map(selected_cards, 'name'))
      card_discarder.discard()

      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(2*_.size(selected_cards))
    }
  }

}
