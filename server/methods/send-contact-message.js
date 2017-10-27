Meteor.methods({
  sendContactMessage(message) {
    Meteor.defer(() => {
      Email.send({
        to: 'Common Democracy <info@commondemocracy.org>',
        from: `${message.name} ${message.email}`,
        subject: `${message.name} sent a message!`,
        text: message.message,
      });
    });
  }
});