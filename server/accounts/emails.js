Accounts.emailTemplates.siteName = "Common Democracy";
Accounts.emailTemplates.from     = "Common Democracy <info@commondemocracy.com>";

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

Accounts.emailTemplates.resetPassword = {
  subject() {
    return TAPi18n.__('emails.reset-password.subject');
  },
  text( user, url ) {
    let emailAddress   = user.emails[0].address,
        token = url.substring(url.lastIndexOf('/')+1, url.length);
        newUrl = Meteor.absoluteUrl() + 'reset/' + token;
        supportEmail   = Meteor.settings.private.fromEmail,
        emailBody      = TAPi18n.__('emails.reset-password.body', {url: urlWithoutHash, supportEmail: supportEmail});

    return emailBody;
  }
};