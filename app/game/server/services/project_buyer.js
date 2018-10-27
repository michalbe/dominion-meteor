ProjectBuyer = class ProjectBuyer {

  constructor(game, player_cards, card_name) {
    this.game = game
    this.player_cards = player_cards
    this.project = ClassCreator.create(card_name)
  }

  buy() {
    if (this.is_valid_buy()) {
      this.update_phase()
      this.buy_event()
      GameModel.update(this.game._id, this.game)
      PlayerCardsModel.update(this.game._id, this.player_cards)
    }
  }

  update_phase() {
    if (_.includes(['action', 'treasure'], this.game.turn.phase)) {
      let start_buy_event_processor = new StartBuyEventProcessor(this.game, this.player_cards)
      start_buy_event_processor.process()
      this.game.turn.phase = 'buy'
    }
  }

  buy_event() {
    this.update_log()
    this.update_turn()
    this.project.buy(this.game, this.player_cards)
  }

  update_turn() {
    this.game.turn.buys -= 1
    this.game.turn.coins -= this.project.coin_cost()
  }

  is_valid_buy() {
    return this.is_debt_free() && this.has_enough_buys() && this.has_enough_money() && !this.already_bought()
  }

  is_debt_free() {
    return this.player_cards.debt_tokens === 0
  }

  has_enough_buys() {
    return this.game.turn.buys > 0
  }

  has_enough_money() {
    return this.game.turn.coins >= this.project.coin_cost()
  }

  already_bought() {
    let self = this
    return _.findIndex(this.player_cards.projects, function(project) {
      return project.name === self.project.to_h().name
    }) > -1
  }

  update_log() {
    this.game.log.push(`<strong>${this.player_cards.username}</strong> puts a cube on ${CardView.render(this.project)}`)
  }

}
