SirVander = class SirVander extends Knights {

  types() {
    return ['action', 'attack', 'knight']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    this.trash_knight(game, player_cards)
  }

  trash_event(trasher) {
    let card_gainer = new CardGainer(trasher.game, trasher.player_cards, 'discard', 'Gold')
    card_gainer.gain_game_card()
  }

}
