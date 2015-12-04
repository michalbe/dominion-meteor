HorseTraders = class HorseTraders extends Card {

  types() {
    return ['action', 'reaction']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    game.turn.buys += 1
    game.turn.coins += 3
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy and +$3`)

    if (_.size(player_cards.hand) > 2) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Discard 2 cards:',
        cards: player_cards.hand,
        minimum: 2,
        maximum: 2
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(HorseTraders.discard_cards)
    } else if (_.size(player_cards.hand) === 0) {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    } else {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand')
      card_discarder.discard_all()
    }
  }

  static discard_cards(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand')
    card_discarder.discard_some(selected_cards)
  }

  attack_event(game, player_cards) {
    let horse_traders_index = _.findIndex(player_cards.hand, function(card) {
      return card.name === 'Horse Traders'
    })
    player_cards.horse_traders.push(player_cards.hand.splice(horse_traders_index, 1)[0])
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${CardView.render(this)}`)
  }

}