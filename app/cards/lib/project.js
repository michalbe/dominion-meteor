Project = class Project {

  name() {
    return _.startCase(this.constructor.name)
  }

  image() {
    return _.snakeCase(this.constructor.name)
  }

  cubes() {
    console.log('cubes', this._cubes)
    return this._cubes;
  }

  type_class() {
    return 'project'
  }

  victory_points() {
    return 0
  }

  point_variable() {
    return false
  }

  buy(game, player_cards) {
    player_cards.projects.push(this.to_h())
  }

  to_h() {
    return {
      name: this.name(),
      image: this.image(),
      types: 'project',
      coin_cost: this.coin_cost()
    }
  }
}
