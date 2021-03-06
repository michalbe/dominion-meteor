PreviousPlayerQuery = class PreviousPlayerQuery {

  constructor(game, player_id) {
    this.game = game
    this.player_id = player_id
  }

  previous_player() {
    return this.game.players[this.previous_player_index()]
  }

  previous_player_index() {
    let player_index = this.current_player_index() - 1
    return player_index === -1 ? _.size(this.game.players) - 1 : player_index
  }

  current_player_index() {
    return _.findIndex(this.game.players, (player) => {
      return player._id === this.player_id
    })
  }

}
