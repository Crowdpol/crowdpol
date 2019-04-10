Meteor.methods({
  sendContactMessage(message,toAddress) {
    if(!toAddress){

      toAddress = Meteor.settings.private.toEmail;
    }
    console.log("toAdress: " + toAddress);
    Meteor.defer(() => {
      Email.send({
        to: 'Common Democracy <' + toAddress + '>',
        from: `${message.name} ${message.email}`,
        subject: `${message.name} sent a message!`,
        text: message.message,
      });
    });
  }
});
