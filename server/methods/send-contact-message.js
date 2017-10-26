Meteor.methods({
  sendContactMessage(message) {
    Meteor.defer(() => {
      Email.send({
        to: 'Common Democracy <tspangenberg1@gmail.com>',
        from: `${message.name} ${message.email}`,
        subject: `${message.name} sent a message!`,
        text: message.message,
      });
    });
  }
});