UserStatus.events.on('connectionLogout', function(player) {
  let user = Meteor.users.findOne(player.userId)
  if (user.current_game) {
    player_connection_message(user.current_game, user.username, 'left')
  }
})

Meteor.methods({
  sendGameMessage: function(message, game_id) {
    let player_ids = _.map(game(game_id).players, '_id')
    Streamy.sessionsForUsers(player_ids).emit('game_message', {
      username: Meteor.user().username,
      message: message
    })
  },
  joinGame: function(game_id) {
    if (Meteor.user()) {
      player_connection_message(game_id, Meteor.user().username, 'joined')
    }
  },
  leftGame: function(game_id) {
    if (Meteor.user()) {
      player_connection_message(game_id, Meteor.user().username, 'left')
    }
  },
  playCard: function(card_name, game_id) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[game_id]) {
        let current_game = game(game_id)
        if (allowed_to_play(current_game)) {
          ActionLock[game_id] = true
          let current_player_cards = player_cards(current_game)
          let card_player = new CardPlayer(current_game, current_player_cards, card_name)
          card_player.play()
          if (turn_over(current_game, current_player_cards)) {
            let turn_ender = new TurnEnder(current_game, current_player_cards)
            turn_ender.end_turn()
          }
          ActionLock[game_id] = false
        }
      }
    })).detach()
  },
  buyCard: function(card_name, game_id) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[game_id]) {
        let current_game = game(game_id)
        if (allowed_to_play(current_game)) {
          ActionLock[game_id] = true
          let current_player_cards = player_cards(current_game)
          let card_buyer = new CardBuyer(current_game, current_player_cards, card_name)
          card_buyer.buy()
          if (turn_over(current_game, current_player_cards)) {
            let turn_ender = new TurnEnder(current_game, current_player_cards)
            turn_ender.end_turn()
          }
          ActionLock[game_id] = false
        }
      }
    })).detach()
  },
  buyEvent: function(card_name, game_id) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[game_id]) {
        let current_game = game(game_id)
        if (allowed_to_play(current_game)) {
          ActionLock[game_id] = true
          let current_player_cards = player_cards(current_game)
          let event_buyer = new EventBuyer(current_game, current_player_cards, card_name)
          event_buyer.buy()
          if (turn_over(current_game, current_player_cards)) {
            let turn_ender = new TurnEnder(current_game, current_player_cards)
            turn_ender.end_turn()
          }
          ActionLock[game_id] = false
        }
      }
    })).detach()
  },
  endTurn: function(game_id) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[game_id]) {
        let current_game = game(game_id)
        if (allowed_to_play(current_game)) {
          ActionLock[game_id] = true
          let turn_ender = new TurnEnder(current_game, player_cards(current_game))
          turn_ender.end_turn()
          ActionLock[game_id] = false
        }
      }
    })).detach()
  },
  playAllCoin: function(game_id) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[game_id]) {
        let current_game = game(game_id)
        if (allowed_to_play(current_game)) {
          ActionLock[game_id] = true
          let all_coin_player = new AllCoinPlayer(current_game, player_cards(current_game))
          all_coin_player.play()
          ActionLock[game_id] = false
        }
      }
    })).detach()
  },
  playCoinToken: function(game_id) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[game_id]) {
        let current_game = game(game_id)
        if (allowed_to_play(current_game)) {
          ActionLock[game_id] = true
          let coin_token_player = new CoinTokenPlayer(current_game, player_cards(current_game))
          coin_token_player.play()
          ActionLock[game_id] = false
        }
      }
    })).detach()
  },
  playVillager: function(game_id) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[game_id]) {
        let current_game = game(game_id)
        if (allowed_to_play(current_game)) {
          ActionLock[game_id] = true
          let villager_player = new VillagerPlayer(current_game, player_cards(current_game))
          villager_player.play()
          ActionLock[game_id] = false
        }
      }
    })).detach()
  },
  playDebtToken: function(game_id) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[game_id]) {
        let current_game = game(game_id)
        if (allowed_to_play(current_game)) {
          ActionLock[game_id] = true
          let debt_token_player = new DebtTokenPlayer(current_game, player_cards(current_game))
          debt_token_player.play()
          let current_player_cards = player_cards(current_game)
          if (turn_over(current_game, current_player_cards)) {
            let turn_ender = new TurnEnder(current_game, current_player_cards)
            turn_ender.end_turn()
          }
          ActionLock[game_id] = false
        }
      }
    })).detach()
  },
  turnEvent: function(selected_cards, turn_event_id) {
    TurnEventFutures[turn_event_id].return(selected_cards)
  }
})

function turn_over(game, player_cards) {
  if (game.turn.phase === 'buy') {
    return game.turn.buys === 0 && (player_cards.debt_tokens === 0 || game.turn.coins === 0) && !has_night_cards(player_cards)
  } else if (game.turn.phase === 'night') {
    return !has_night_cards(player_cards)
  } else {
    return false
  }
}

function has_night_cards(player_cards) {
  return _.some(player_cards.hand, function(card) {
    return _.includes(_.words(card.types), 'night')
  })
}

function player_cards(game) {
  return PlayerCardsModel.findOne(game._id, game.turn.player._id)
}

function game(game_id) {
  return GameModel.findOne(game_id)
}

function allowed_to_play(game) {
  if (game.turn.possessed) {
    return Meteor.userId() === game.turn.possessed._id
  } else {
    return Meteor.userId() === game.turn.player._id
  }
}

function player_connection_message(game_id, username, direction) {
  let game = GameModel.findOne(game_id)
  if (game) {
    let player_ids = _.map(game.players, '_id')
    Streamy.sessionsForUsers(player_ids).emit('game_message', {
      message: `<em>${username} has ${direction} the game</em>`
    })
  }
}
