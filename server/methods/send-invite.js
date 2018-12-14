Meteor.methods({
  sendInvite(email, role, url, fromEmail) {
    console.log('sendInvite called');
    Meteor.defer(() => {
      Email.send({
        to: `${email}`,
        from: TAPi18n.__('emails.send-invite.from', {name: Meteor.settings.private.deploymentName, email: fromEmail}),
        subject: TAPi18n.__('emails.send-invite.subject'),
        text: TAPi18n.__('emails.send-invite.body', {role: role, url: url})
      });
    });
  },
  sendProposalInvite(toEmail, authorName, url, proposalName, fromEmail) {
    console.log('sendProposalInvite called');
    Meteor.defer(() => {
      Email.send({
        to: `${toEmail}`,
        from: TAPi18n.__('emails.send-proposal-invite.from', {authorName: authorName, email: fromEmail}),
        subject: TAPi18n.__('emails.send-proposal-invite.subject'),
        text: TAPi18n.__('emails.send-proposal-invite.body', {authorName:authorName, proposalName: proposalName, url: url})
      });
    });
  }
});
