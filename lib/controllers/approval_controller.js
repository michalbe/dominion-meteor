ApprovalController = ApplicationController.extend({

  onBeforeAction: function () {
    let player = Meteor.users.findOne(Meteor.userId())
    if (player.approved && !player.disabled) {
      this.redirect(`/lobby`)
    } else {
      this.next()
    }
  },

  waitOn: function () {
    return [
      Meteor.subscribe('players')
    ]
  }

})
