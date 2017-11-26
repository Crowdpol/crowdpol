import './contact.html'

Template.contact.onRendered( function() {
  $( "#contact-form" ).validate({
    rules: {
      'contact-email': {
        required: true
      },
      'contact-name': {
        required: true
      },
      'contact-subject': {
        required: true
      },
      'contact-message': {
        required: true
      },
    },
    messages: {
      'contact-email': {
        required: 'Please enter your email address.'
      },
      'contact-name': {
        required: 'Please enter your name.'
      },
      'contact-subject': {
        required: 'Please provide a subject for your message.'
      },
      'contact-message': {
        required: 'Please provide a messsage.'
      },
    }
  })
});

Template.contact.events({
	'submit form' (event, template){

		event.preventDefault();
		let message = {
			name: template.find('[name="contact-name"]').value,
			email: template.find('[name="contact-email"]').value,
			subject: template.find('[name="contact-subject"]').value,
			message: template.find('[name="contact-message"]').value
		};

		Meteor.call('sendContactMessage', message, function(error){
			if (error){
				Bert.alert(error.reason, 'danger');
			} else {
				template.find('#contact-form').reset();
				Bert.alert(TAPi18n.__('pages.contact.alerts.contact-message-sent'), 'success');
			}
		});
	}

});