Project = class Project {

  name() {
    return _.startCase(this.constructor.name)
  }

  image() {
    return _.snakeCase(this.constructor.name)
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

  to_h() {
    return {
      name: this.name(),
      image: this.image(),
      types: 'state'
    }
  }
}
