Meteor.methods({
  sendApproval(email, type) {
    Meteor.defer(() => {
      Email.send({
        to: `${email}`,
        from: TAPi18n.__('emails.send-approval.from', {name: Meteor.settings.private.deploymentName, email: Meteor.settings.private.fromEmail}),
        subject: TAPi18n.__('emails.send-approval.subject', {type: type}),
        text: TAPi18n.__('emails.send-approval.body', {type: type}),
      });
    });
  },
  sendRejection(email, type) {
    Meteor.defer(() => {
      Email.send({
        to: `${email}`,
        from: TAPi18n.__('emails.rejection-email.from', {name: Meteor.settings.private.deploymentName, email: Meteor.settings.private.fromEmail}),
        subject: TAPi18n.__('emails.rejection-email.subject', {type: type}),
        text: TAPi18n.__('emails.rejection-email.body', {type: type}),
      });
    });
  },
  sendNewsletterConfirmation(email) {
    Meteor.defer(() => {
      Email.send({
        to: `${email}`,
        from: TAPi18n.__('emails.newsletter-confirmation.from', {name: Meteor.settings.private.deploymentName, email: Meteor.settings.private.fromEmail}),
        subject: TAPi18n.__('emails.newsletter-confirmation.subject'),
        text: TAPi18n.__('emails.newsletter-confirmation.body'),
      });
      console.log("sendNewsletterConfirmation sent");
    });
  },
});
