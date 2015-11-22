Watchtower = class Watchtower extends Card {

  types() {
    return ['action', 'reaction']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let cards_to_draw = 6 - _.size(player_cards.hand)
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(cards_to_draw)
  }

  gain_reaction(game, player_cards, gainer) {
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(this)}`)
    let turn_event_id = TurnEvents.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Trash ${CardView.render(_.first(player_cards[gainer.destination]))} or put it on top of your deck?`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: 'Trash', value: 'trash'},
        {text: 'Top of Deck', value: 'deck'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, gainer)
    turn_event_processor.process(Watchtower.process_response)
  }

  static process_response(game, player_cards, response, gainer) {
    response = response[0]
    if (response === 'trash') {
      let card_trasher = new CardTrasher(game, player_cards, gainer.destination, gainer.card_name)
      card_trasher.trash()
      gainer.card_name = ''
    } else if (response === 'deck') {
      player_cards.deck.unshift(player_cards[gainer.destination].shift())
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(_.first(player_cards.deck))} on top of their deck`)
      gainer.destination = 'deck'
    }
  }

}