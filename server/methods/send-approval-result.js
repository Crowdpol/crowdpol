Meteor.methods({
  sendApproval(email, type) {
    Meteor.defer(() => {
      Email.send({
        to: `${email}`,
        from: `Common Democracy <info@commondemocracy.org>`,
        subject: `Your request to be a ${type} has been approved`,
        text: `An administrator has approved your request to be a ${type}. You can now log in as a ${type}.`,
      });
    });
  },
  sendRejection(email, type) {
    Meteor.defer(() => {
      Email.send({
        to: `${email}`,
        from: `Common Democracy <info@commondemocracy.org>`,
        subject: `our request to be a ${type} has been rejected`,
        text: `An administrator has rejected your request to be a ${type}.`,
      });
    });
  },
  sendNewsletterConfirmation(email) {
    Meteor.defer(() => {
      Email.send({
        to: `${email}`,
        from: `Common Democracy <info@commondemocracy.org>`,
        subject: `Newsletter Signup Confirmation`,
        text: `Thank you for signing up to our newsletter. We will be sure to keep you up to date.`,
      });
      console.log("sendNewsletterConfirmation sent");
    });
  },
});