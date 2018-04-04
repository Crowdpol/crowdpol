if (Meteor.settings && Meteor.settings.forceSSL) {
  _.extend(Meteor.absoluteUrl.defaultOptions, {secure: true});
}