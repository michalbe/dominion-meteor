var SlackBot = require('simple-slack-bot');
var starting_sentence = [
	'Kolejny pojedynek zakonczony.',
	'Kolejny pojedynek zakonczony.',
	'Kolejny pojedynek zakonczony.',
	'Mecz dobiegl konca.',
	'Co to byl za mecz!',
	'Kolejne niesamowite spotkanie za nami.',
	'Ci co nie widzieli niech zaluja. Ci co widzieli, nigdy nie zapomna!',
	'Za nami kolejne spotkanie ekstraklasy. Spotkanie *na szczycie*, chcialoby sie rzec.',
	'Uhh, uhhh, coz to byly za emocje! Kolejny mecz za nami.',
	'Spotkanie nudne jak flaki z olejem.'
];

var ending_sentences = [
	'* P O T E Z N I E!*',
	'To byl *POGROM*!',
	'To byl *POGROM*!',
	'Nie najgorzej...',
	'Nie najgorzej...',
	'Nie najgorzej...',
	'Super!',
	'O tej porazce beda uczyc sie kolejne pokolenia.',
	'Niesamowite!',
	'Tak srednio bym powiedzial...',
	'Jakbym nie widzial, to bym nie uwierzyl.',
	'Bog mi swiadkiem - tak bylo!',
	'W ptasiej kulturze, nazywamy to kutasim ruchem.',
	'Slepej kurze tez sie ziarno trafia...',
	'To bylo *upokorzenie* rywala!',
	'Ale mu dojebal!!!'
];

GameEnder = class GameEnder {

  constructor(game) {
    this.game = game
    this.players_cards = PlayerCardsModel.find(this.game._id)
  }

  end_game() {
    this.update_game()
    this.update_players()
    this.log_game()
    this.update_player_rankings()
		let players = this.game.players.map((player) => {
			let points = this.game.scores.find((score) => {
				return score.username === player.username;
			}).points;
			return player.username + ' *(' + points + ')*';
		}).join(', ');

		let winners = this.winners();
		let startingg = starting_sentence[~~(Math.random()*starting_sentence.length)];
		let endingg = ending_sentences[~~(Math.random()*ending_sentences.length)];

		var bot = new SlackBot(
		    {
		        cached: true,
		        token: 'xoxb-323136184257-SR3hfVTpFa96gjEkdVbxOiKM',
		        name: 'szpakowski-dominion'
		    }
		);

		bot.on('slack.login', function() {
		    var params = {
		        icon_emoji: ':shield:'
		    };

		    bot.postMessageToChannel('gramy-w-gry', startingg + ' Udzial wzieli: ' + players + '. Wygral: *' + winners + '*. ' + endingg, params, function (result) {
		 			bot.logout();
		    });

		});
		bot.login();
  }

  update_game() {
    this.game.scores = this.calculate_scores()
    this.game.finished = true
    this.game.winners = this.winners()
    GameModel.update(this.game._id, this.game)
  }

  update_players() {
    let player_ids = _.map(this.game.players, '_id')
    Meteor.users.update({_id: {$in: player_ids}}, {$unset: {current_game: ''}}, {multi: true})
  }

  log_game() {
    GameHistory.insert(_.merge(this.game, {created_at: new Date()}))
  }

  update_player_rankings() {
    let usernames = _.map(this.game.players, 'username')
    let player_rankings = PlayerRankings.find({username: {$in: usernames}}).fetch()
    _.each(player_rankings, (player_ranking) => {
      let winner = _.includes(this.game.winners, player_ranking.username)
      if (winner) {
        player_ranking.wins += 1
      } else {
        player_ranking.losses += 1
      }
      let opponent_names = _.difference(usernames, [player_ranking.username])
      _.each(opponent_names, function(opponent_name) {
        let opponent_index = _.findIndex(player_ranking.opponents, function(opponent) {
          return opponent.username === opponent_name
        })
        if (opponent_index === -1) {
          player_ranking.opponents.push({
            username: opponent_name,
            wins: winner ? 1 : 0,
            losses: winner ? 0 : 1
          })
        } else {
          let opponent_ranking = player_ranking.opponents[opponent_index]
          if (winner) {
            opponent_ranking.wins += 1
          } else {
            opponent_ranking.losses += 1
          }
          player_ranking.opponents[opponent_index] = opponent_ranking
        }
      })
      PlayerRankings.update(player_ranking._id, player_ranking)
    })
  }

  calculate_scores() {
    return _.chain(this.players_cards).map((player_cards) => {
      let all_cards = AllPlayerCardsQuery.find(player_cards, true).concat(player_cards.states)
      let point_cards = this.point_cards(all_cards)
      let landmark_cards = this.landmark_cards(all_cards)
      let deck_breakdown = this.deck_breakdown(all_cards)
      let player_score = {
        username: player_cards.username,
        point_cards: point_cards,
        points: this.card_score(point_cards.concat(landmark_cards)) + player_cards.victory_tokens,
        turns: player_cards.turns,
        deck_breakdown: deck_breakdown
      }
      if (player_cards.victory_tokens > 0) {
        player_score.victory_tokens = player_cards.victory_tokens
      }
      if (_.size(landmark_cards) > 0) {
        player_score.landmark_cards = landmark_cards
      }
      return player_score
    }).sortBy(function(score) {
      return -score.points
    }).value()
  }

  point_cards(player_cards) {
    return _.chain(player_cards).map(function(player_card) {
      let card = ClassCreator.create(player_card.name)
      return {
        name: card.name(),
        types: card.type_class(),
        points: card.victory_points(player_cards, player_card.source),
        point_variable: card.point_variable(player_cards)
      }
    }).filter(function(point_card) {
      return point_card.points !== 0
    }).groupBy(function(point_card) {
      return point_card.name
    }).map(function(cards, card_name) {
      return {
        name: card_name,
        count: _.size(cards),
        types: _.head(cards).types,
        point_variable: _.head(cards).point_variable,
        points: _.head(cards).points * _.size(cards)
      }
    }).value()
  }

  landmark_cards(player_cards) {
    return _.chain(this.game.landmarks).map((landmark) => {
      let landmark_card = ClassCreator.create(landmark.name)
      return {
        name: landmark_card.name(),
        types: landmark_card.type_class(),
        points: landmark_card.victory_points(player_cards, this.game),
        point_variable: landmark_card.point_variable(player_cards, this.game)
      }
    }).filter(function(point_card) {
      return point_card.points !== 0
    }).value()
  }

  deck_breakdown(player_cards) {
    return _.chain(player_cards).groupBy(function(card) {
      return card.name
    }).map(function(cards, card_name) {
      return {
        name: card_name,
        count: _.size(cards),
        types: _.head(cards).types
      }
    }).value()
  }

  card_score(point_cards) {
    return _.reduce(point_cards, function(total, point_card) {
      return point_card.points + total
    }, 0)
  }

  top_score() {
    return _.head(this.game.scores).points
  }

  winners() {
    let winners = _.filter(this.game.scores, (score) => {
      return score.points === this.top_score()
    })
    if (_.size(winners) > 1) {
      winners = this.tiebreaker(winners)
    }
    return _.map(winners, 'username').join(', ')
  }

  tiebreaker(top_scorers) {
    return _.reduce(top_scorers, function(winners, top_scorer) {
      if (_.isEmpty(winners) || top_scorer.turns === winners[0].turns) {
        winners.push(top_scorer)
      } else if (top_scorer.turns < winners[0].turns) {
        winners = [top_scorer]
      }
      return winners
    }, [])
  }
}
