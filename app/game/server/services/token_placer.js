TokenPlacer = class TokenPlacer {

  constructor(game, player_cards, token, pile = undefined) {
    this.game = game
    this.player_cards = player_cards
    this.token = token
    this.pile = pile
    if (this.pile) {
      this.new_pile_index = _.findIndex(this.game.cards, (card) => {
        return card.name === this.pile.name
      })
    }
  }

  place() {
    if (_.contains(this.pile_tokens(), this.token)) {
      this.remove_old_pile_token()
      this.remove_old_player_token()
      this.place_new_pile_token()
      this.place_player_token()
    }
  }

  remove_old_pile_token() {
    var token_index
    let old_pile_index = _.findIndex(this.game.cards, (card) => {
      token_index = _.findIndex(card.tokens, (token) => {
        return token.username === this.player_cards.username && token.name === this.token
      })
      return token_index !== -1
    })
    if (old_pile_index !== -1) {
      delete this.game.cards[old_pile_index].tokens[token_index]
    }
  }

  remove_old_player_token() {
    let token_index = _.findIndex(this.player_cards.tokens.pile, (token) => {
      return token.effect === this.token
    })
    if (token_index !== -1) {
      delete this.player_cards.tokens.pile[token_index]
    }
  }

  place_new_pile_token() {
    this.game.cards[this.new_pile_index].tokens.push({
      username: this.player_cards.username,
      color: this.player_cards.color,
      name: this.token,
      text: this.token_text()
    })
    this.game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places their +1 ${this.token()} token on ${this.pile.name}`)
  }

  place_player_token() {
    this.player_cards.tokens.pile.push({
      card: this.pile,
      effect: this.token
    })
  }

  pile_tokens() {
    return ['card', 'action', 'buy', 'coin']
  }

  token_text() {
    if (this.token === 'card') {
      return '+C'
    } else if (this.token === 'action') {
      return '+A'
    } else if (this.token === 'buy') {
      return '+B'
    } else if (this.token === 'coin') {
      return '+$'
    }
  }

}
