Villa = class Villa extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    game.turn.actions += 2
    game.turn.buys += 1
    let gained_coins = CoinGainer.gain(game, player_cards, 1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions, +1 buy, and +$${gained_coins}`)
  }

  destination() {
    return 'hand'
  }

  gain_event(gainer) {
    gainer.game.turn.actions += 1
    gainer.game.log.push(`&nbsp;&nbsp;<strong>${gainer.player_cards.username}</strong> gets +1 action`)
    if (gainer.game.turn.phase === 'buy') {
      gainer.game.turn.phase = 'action'
      gainer.game.log.push(`&nbsp;&nbsp;<strong>${gainer.player_cards.username}</strong> returns to their action phase`)
    }
  }

}
