Conclave = class Conclave extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let gained_coins = CoinGainer.gain(game, player_cards, 2)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)

    let in_play_card_names = _.map(player_cards.playing.concat(player_cards.in_play).concat(player_cards.duration).concat(player_cards.permanent), 'name')
    let eligible_cards = _.filter(player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'action') && !_.includes(in_play_card_names, card.name)
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose an action to play (Or none to skip):',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Conclave.play_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not play an action`)
    }
  }

  static play_card(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let card_player = new CardPlayer(game, player_cards, selected_cards[0].name, true)
      card_player.play()

      game.turn.actions += 1
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not play an action`)
    }
  }

}
