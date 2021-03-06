CoinOfTheRealm = class CoinOfTheRealm extends Card {

  types() {
    return ['treasure', 'reserve']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    CoinGainer.gain(game, player_cards, 1)
    this.move_to_tavern(game, player_cards, 'Coin Of The Realm')
  }

  action_resolution_event(game, player_cards) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_yes_no',
      instructions: `Call ${CardView.render(this)}?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(CoinOfTheRealm.call_coin)
  }

  static call_coin(game, player_cards, response) {
    if (response === 'yes') {
      let coin_index = _.findIndex(player_cards.tavern, function(card) {
        return card.name === 'Coin Of The Realm'
      })
      coin = player_cards.tavern.splice(coin_index, 1)[0]
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> calls ${CardView.render(coin)}`)
      player_cards.in_play.push(coin)
      game.turn.actions += 2
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions`)
    }
  }

}
