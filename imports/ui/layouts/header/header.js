import { Session } from 'meteor/session';

import './header.html';

Template.Header.helpers({
	lang() {
		var str = Session.get("i18n_lang")
		return str.toUpperCase();
	}
});

Template.Header.events({
  'click .lang-sel' : function(e){
    var lang = $(e.currentTarget).attr("id");
    Session.set("i18n_lang",lang)
    TAPi18n.setLanguage(lang);
  },
  'click #nav-logout' : function(e){
    event.preventDefault();
	Meteor.logout();
  },
});

