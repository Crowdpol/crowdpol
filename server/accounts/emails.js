Accounts.emailTemplates.siteName = "Common Democracy";
Accounts.emailTemplates.from     = "Common Democracy <info@commondemocracy.org>";

Accounts.emailTemplates.verifyEmail = {
  subject() {
    return TAPi18n.__('emails.verify-email.subject');
  },
  text( user, url ) {
    let emailAddress   = user.emails[0].address,
        urlWithoutHash = url.replace( '#/', '' ),
        supportEmail   = Meteor.settings.private.fromEmail,
        emailBody      = TAPi18n.__('emails.verify-email.body', {emailAddress: emailAddress, url: urlWithoutHash, supportEmail: supportEmail});

    return emailBody;
  }
};
