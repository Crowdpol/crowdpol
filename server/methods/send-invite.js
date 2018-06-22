Meteor.methods({
  sendInvite(email, role, url, fromEmail) {
    Meteor.defer(() => {
      Email.send({
        to: `${email}`,
        from: TAPi18n.__('emails.send-invite.from', {name: Meteor.settings.private.deploymentName, email: fromEmail}),
        subject: TAPi18n.__('emails.send-invite.subject'),
        text: TAPi18n.__('emails.send-invite.body', {role: role, url: url})
      });
    });
  }
});