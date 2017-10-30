Meteor.methods({
  sendInvite(email, url) {
    Meteor.defer(() => {
      Email.send({
        to: `${email}`,
        from: `Common Democracy <info@commondemocracy.org>`,
        subject: `Invitation to Common Democracy`,
        text: `You have been invited to participate in Common Democracy. Click the link to register: ${url}`,
      });
    });
  }
});