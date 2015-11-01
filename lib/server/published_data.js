Meteor.publish('game', function() {
  return Games.find()
})

Meteor.publish('player_cards', function() {
  return PlayerCards.find({'player_id': this.userId})
})

Meteor.publish('turn_event', function() {
  return TurnEvents.find()
})

Meteor.publish('players', function() {
  return Meteor.users.find()
})

Meteor.publish('proposal', function() {
  return Proposals.find({'players._id': this.userId})
})