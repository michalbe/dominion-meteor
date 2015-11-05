Tactician = class Tactician extends Card {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    if (_.size(player_cards.hand) > 0) {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand')
      card_discarder.discard_all()
      return 'duration'
    }
  }

  duration(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(5, false)
    game.turn.buys += 1
    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> draws 5 cards and gets +1 buy and +1 action from ${CardView.render(this)}`)
  }

}
