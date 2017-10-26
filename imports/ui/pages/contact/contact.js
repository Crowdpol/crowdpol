import './contact.html'

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
				Bert.alert('Message was sent!', 'success');+
			}
		});
	}

});