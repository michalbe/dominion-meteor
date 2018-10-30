EndBuyEventProcessor = class EndBuyEventProcessor {

  static reserve_events() {
    return ['Wine Merchant']
  }

  static project_events() {
    return ['Exploration']
  }

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
    this.find_end_buy_events()
  }

  find_end_buy_events() {
    let reserve_events = _.filter(this.player_cards.tavern, (card) => {
      if (_.includes(EndBuyEventProcessor.reserve_events(), card.inherited_name)) {
        if (card.inherited_name === 'Wine Merchant') {
          return this.game.turn.coins >= 2
        } else {
          return true
        }
      }
    })

    let project_events = _.filter(this.player_cards.projects, (project) => {
      if (_.includes(EndBuyEventProcessor.project_events(), project.name)) {
        if (project.name === 'Exploration') {
          return _.size(this.game.turn.bought_cards) === 0
        } else {
          return true
        }
      }
    });
    this.end_buy_events = reserve_events.concat(project_events)
  }

  process() {
    if (!_.isEmpty(this.end_buy_events)) {
      this.game.log.push(`<strong>${this.player_cards.username}</strong> ends their buy phase`)
      if (_.size(this.end_buy_events) > 1) {
        let turn_event_id = TurnEventModel.insert({
          game_id: this.game._id,
          player_id: this.player_cards.player_id,
          username: this.player_cards.username,
          type: 'sort_cards',
          instructions: 'Choose order to resolve end of buy phase events (leftmost will be first):',
          cards: this.end_buy_events
        })
        let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id, this.end_buy_events)
        turn_event_processor.process(EndBuyEventProcessor.event_order)
      } else {
        EndBuyEventProcessor.event_order(this.game, this.player_cards, _.map(this.end_buy_events, 'name'), this.end_buy_events)
      }
    }
  }

  static event_order(game, player_cards, event_name_order, events) {
    _.each(event_name_order, function(event_name) {
      let event_index = _.findIndex(events, function(event) {
        return event.name === event_name
      })
      let event = events.splice(event_index, 1)[0]
      if (event_name === 'Estate' && player_cards.tokens.estate) {
        event_name = 'InheritedEstate'
      }
      let selected_event = ClassCreator.create(event_name)
      selected_event.end_buy_event(game, player_cards)
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
    })
  }

}
