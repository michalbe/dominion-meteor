BuyEventProcessor = class BuyEventProcessor {

  static reaction_cards() {
    return ['Hovel']
  }

  static landmark_cards() {
    return ['Basilica', 'Colonnade', 'Defiled Shrine']
  }

  static event_cards() {
    return ['Noble Brigand', 'Farmland', 'Mint', 'Messenger', 'Port', 'Forum']
  }

  static in_play_event_cards() {
    return ['Haggler', 'Talisman', 'Hoard']
  }

  static overpay_cards() {
    return ['Stonemason', 'Doctor', 'Masterpiece', 'Herald']
  }

  static duration_attack_cards() {
    return ['Haunted Woods', 'Swamp Hag']
  }

  constructor(buyer) {
    this.buyer = buyer
    this.bought_card_name = this.buyer.card.name()
    this.bought_card = this.buyer.card.to_h()
    if (this.bought_card_name === 'Estate' && this.buyer.player_cards.tokens.estate) {
      this.bought_card_name = this.buyer.player_cards.tokens.estate.name
      this.bought_card = ClassCreator.create('Inherited Estate').to_h(this.buyer.player_cards)
    }
    this.find_buy_events()
  }

  find_buy_events() {
    this.buy_events = []
    if (_.includes(BuyEventProcessor.event_cards(), this.bought_card_name)) {
      if (this.bought_card_name === 'Messenger') {
        if (_.size(this.buyer.game.turn.bought_cards) === 1) {
          this.buy_events.push(this.bought_card)
        }
      } else {
        this.buy_events.push(this.bought_card)
      }
    }

    _.each(this.buyer.game.landmarks, (card) => {
      if (_.includes(BuyEventProcessor.landmark_cards(), card.name)) {
        if (card.name === 'Basilica' && card.victory_tokens > 0 && this.buyer.game.turn.coins >= 2) {
            this.buy_events.push(card)
        } else if (card.name === 'Colonnade' && card.victory_tokens > 0 && _.includes(this.buyer.card.types(), 'action') && _.some(this.buyer.player_cards.in_play.concat(this.buyer.player_cards.duration).concat(this.buyer.player_cards.permanent), (card) => {return card.name === this.bought_card_name})) {
            this.buy_events.push(card)
        } else if (card.name === 'Defiled Shrine' && card.victory_tokens > 0 && this.buyer.card.name() === 'Curse') {
            this.buy_events.push(card)
        }
      }
    })

    if (_.includes(BuyEventProcessor.overpay_cards(), this.buyer.card.name()) && this.buyer.game.turn.coins > 0) {
      this.buy_events.push(this.buyer.card.to_h())
    }

    _.each(this.buyer.player_cards.hand, (card) => {
      if (_.includes(BuyEventProcessor.reaction_cards(), card.name)) {
        if (card.name === 'Hovel') {
          if (_.includes(this.buyer.card.types(this.buyer.player_cards), 'victory')) {
            this.buy_events.push(card)
          }
        }
      }
    })

    _.each(this.buyer.player_cards.in_play, (card) => {
      if (_.includes(BuyEventProcessor.in_play_event_cards(), card.inherited_name)) {
        if (card.inherited_name === 'Talisman') {
          if (!_.includes(this.buyer.card.types(this.buyer.player_cards), 'victory') && CardCostComparer.coin_less_than(this.buyer.game, this.buyer.card.to_h(), 5)) {
            this.buy_events.push(card)
          }
        } else if (card.inherited_name === 'Hoard') {
          if (_.includes(this.buyer.card.types(this.buyer.player_cards), 'victory')) {
            this.buy_events.push(card)
          }
        } else {
          this.buy_events.push(card)
        }
      }
    })

    _.each(this.buyer.player_cards.duration_attacks, (card) => {
      if (_.includes(BuyEventProcessor.duration_attack_cards(), card.name)) {
        this.buy_events.push(card)
      }
    })

    let trashing_token = _.find(this.buyer.player_cards.tokens.pile, (token) => {
      return token.effect === 'trashing'
    })
    if (trashing_token && trashing_token.card.name === this.buyer.card.stack_name()) {
      this.buy_events.push({name: 'Trash Token'})
    }
  }

  process() {
    if (!_.isEmpty(this.buy_events)) {
      let mandatory_buy_events = _.filter(this.buy_events, function(event) {
        return _.includes(BuyEventProcessor.event_cards().concat(BuyEventProcessor.in_play_event_cards()).concat(BuyEventProcessor.overpay_cards()).concat(BuyEventProcessor.duration_attack_cards()).concat(BuyEventProcessor.landmark_cards()), event.inherited_name)
      })
      if (_.size(this.buy_events) === 1 && !_.isEmpty(mandatory_buy_events)) {
        BuyEventProcessor.buy_event(this.buyer.game, this.buyer.player_cards, this.buy_events, this)
      } else {
        GameModel.update(this.buyer.game._id, this.buyer.game)
        let instructions = `Choose Buy Event To Resolve for ${CardView.render(this.buyer.card)}`
        let minimum = 1
        if (_.isEmpty(mandatory_buy_events)) {
          instructions += ' (Or none to skip)'
          minimum = 0
        }
        let turn_event_id = TurnEventModel.insert({
          game_id: this.buyer.game._id,
          player_id: this.buyer.player_cards.player_id,
          username: this.buyer.player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `${instructions}:`,
          cards: this.buy_events,
          minimum: minimum,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(this.buyer.game, this.buyer.player_cards, turn_event_id, this)
        turn_event_processor.process(BuyEventProcessor.buy_event)
      }
    }
  }

  static buy_event(game, player_cards, selected_cards, buy_event_processor) {
    if (!_.isEmpty(selected_cards)) {
      if (selected_cards[0].name === 'Trash Token') {
        if (_.size(player_cards.hand) > 1) {
          let turn_event_id = TurnEventModel.insert({
            game_id: game._id,
            player_id: player_cards.player_id,
            username: player_cards.username,
            type: 'choose_cards',
            player_cards: true,
            instructions: 'Choose a card to trash:',
            cards: player_cards.hand,
            minimum: 1,
            maximum: 1
          })
          let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
          turn_event_processor.process(BuyEventProcessor.trash_card)
        } else if (_.size(player_cards.hand) === 1) {
          BuyEventProcessor.trash_card(game, player_cards, player_cards.hand)
        } else {
          game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
        }
      } else {
        let card_name = selected_cards[0].name
        if (card_name === 'Estate' && player_cards.tokens.estate) {
          card_name = 'InheritedEstate'
        }
        let selected_card = ClassCreator.create(card_name)
        if (_.includes(BuyEventProcessor.reaction_cards(), selected_card.inherited_name(player_cards))) {
          selected_card.buy_reaction(game, player_cards, buy_event_processor.buyer)
        } else {
          selected_card.buy_event(buy_event_processor.buyer)
        }
      }

      let buy_event_index = _.findIndex(buy_event_processor.buy_events, function(event) {
        return event.name === selected_cards[0].name
      })
      buy_event_processor.buy_events.splice(buy_event_index, 1)

      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      buy_event_processor.process()
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    let card_trasher = new CardTrasher(game, player_cards, 'hand', _.map(selected_cards, 'name'))
    card_trasher.trash()
  }

}
