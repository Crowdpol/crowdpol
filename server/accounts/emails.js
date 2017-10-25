Accounts.emailTemplates.siteName = "Common Democracy";
Accounts.emailTemplates.from     = "Common Democracy <info@commondemocracy.com>";

Accounts.emailTemplates.verifyEmail = {
  subject() {
    return "Common Democracy: Please Verify Your Email";
  },
  text( user, url ) {
    let emailAddress   = user.emails[0].address,
        urlWithoutHash = url.replace( '#/', '' ),
        supportEmail   = "info@commondemocracy.com",
        emailBody      = `To verify your email address (${emailAddress}) visit the following link:\n\n${urlWithoutHash}\n\n If you did not request this verification, please ignore this email. If you feel something is wrong, please contact our support team: ${supportEmail}.`;

    return emailBody;
  }
};