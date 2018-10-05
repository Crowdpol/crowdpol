import './settings.html';
import { Communities } from '../../../../api/communities/Communities.js'
import RavenClient from 'raven-js';


Template.AdminSettings.onCreated(function(){
  self = this;
  var communityId = LocalStore.get('communityId');

  var dict = new ReactiveDict();
	self.dict = dict;

	var defaultStartDate = moment().format('YYYY-MM-DD');
	var defaultEndDate = moment().add(1, 'year').format('YYYY-MM-DD');
  self.autorun(function(){
    self.subscribe('communities.all')
    if (communityId){
      // Edit an existing proposal
      self.subscribe('community', communityId, function(){
        settings = Communities.findOne({_id: communityId}).settings;
        dict.set( 'showDates', settings.showDates || true);
        dict.set( 'startDate', moment(settings.defaultStartDate).format('YYYY-MM-DD') || defaultStartDate );
        dict.set( 'endDate', moment(settings.defaultEndDate).format('YYYY-MM-DD') || defaultEndDate);
        dict.set( 'colorScheme', settings.colorScheme)
        dict.set( 'logoUrl', settings.logoUrl || null);
        dict.set( 'homepageImageUrl', settings.homepageImageUrl || null);
        dict.set( 'homepageBannerText', settings.homepageBannerText || null);
        dict.set( 'homepageIntroText', settings.homepageIntroText  || null);
        dict.set( 'aboutText', settings.aboutText || null);
        dict.set( 'languageSelector', settings.languageSelector);
        dict.set( 'defaultLanguage', settings.defaultLanguage || null);
        dict.set( 'languages', settings.languages || []);
        dict.set( 'emailWhitelist', settings.emailWhitelist || null);
        dict.set( 'enforceWhitelist', settings.enforceWhitelist || null);
        console.log(communityId);
        console.log(settings);
      });
    } else {
      console.log("could not find community Id");
    }

  });
});

Template.AdminSettings.onRendered(function(){
  let showDates = Template.instance().dict.get('showDates');
  if(showDates==true){
    $("#user-dates").prop('checked',true);
    $('#static-dates').prop('checked',false);
    $("#setDates").hide()
  }else{
    $("#user-dates").prop('checked',false);
    $('#static-dates').prop('checked',true);
    $('#start-datepicker').val(moment(Template.instance().dict.get('startDate')).format('YYYY-MM-DD'))
    $('#end-datepicker').val(moment(Template.instance().dict.get('endDate')).format('YYYY-MM-DD'))
    $("#setDates").show()
  }
  $('#end-datepicker').datepicker({ dateFormat: 'yy-mm-dd' });
  $('#start-datepicker').datepicker({ dateFormat: 'yy-mm-dd' });



  $("#languageOptions").hide();
  let languageSelector = Template.instance().dict.get('languageSelector');

  if(languageSelector==true){
    console.log("languageSelector is true");
    $("#languageSelector").prop('checked', true);
    $("#languageOptions").show()
  }else{
    console.log("languageSelector is false");
    $("#languageSelector").prop('checked', false);
    $("#languageOptions").hide()
  }

  let enforceWhitelist = Template.instance().dict.get('enforceWhitelist');
  console.log(enforceWhitelist);
  if(enforceWhitelist==true){
    console.log("enforceWhitelistis true");
    $("#enforceWhitelist").prop('checked', true);
    $("#emailWhitelistContainer").show()
  }else{
    console.log("enforceWhitelistis false");
    $("#enforceWhitelist").prop('checked', false);
    $("#emailWhitelistContainer").hide()
  }

});

Template.AdminSettings.helpers({

	languages: function(){
    return Template.instance().dict.get('languages');
  },
  isSelected: function(language){
    let defaultLanguage = Template.instance().dict.get('defaultLanguage');
    if(defaultLanguage==language){
      return true;
    }
    return false;
  },
  defaultDates: function(){
    let showDates = Template.instance().dict.get('showDates');
    if(showDates){
      return false;
    }
    return true;
  },
  customDates: function(){
    let showDates = Template.instance().dict.get('showDates');
    if(showDates){
      return true;
    }
    return false;
  },
  homepageImageUrl: function(){
    return Template.instance().dict.get('homepageImageUrl');
  },
  homepageBannerText: function(){
    return Template.instance().dict.get('homepageBannerText');
  },
  homepageIntroText: function(){
    return Template.instance().dict.get('homepageIntroText');
  },
  aboutText: function(){
    return Template.instance().dict.get('aboutText');
  },
});

Template.AdminSettings.events({
  'change #languageSelector' (event, template){
    let languageSelector = Template.instance().dict.get('languageSelector');
    if(languageSelector){
      Template.instance().dict.set('languageSelector',false);
      $("#languageSelector").prop('checked', false);
  		$("#languageOptions").hide()
    }else{
      Template.instance().dict.set('languageSelector',true);
      $("#languageSelector").prop('checked', true);
  		$("#languageOptions").show()
    }

	},
  'change #enforceWhitelist' (event, template){

    let enforceWhitelist = Template.instance().dict.get('enforceWhitelist');
    console.log(enforceWhitelist);
    if(enforceWhitelist){
      Template.instance().dict.set('enforceWhitelist',false);
      $("#enforceWhitelist").prop('checked', false);
  		$("#emailWhitelistContainer").hide()
    }else{
      Template.instance().dict.set('enforceWhitelist',true);
      $("#enforceWhitelist").prop('checked', true);
  		$("#emailWhitelistContainer").show()
    }

	},
	'change #user-dates' (event, template){
    Template.instance().dict.set('showDates',true)
		$("#setDates").hide()
	},
  'change #static-dates' (event, template){
    Template.instance().dict.set('showDates',false)
		$("#setDates").show()
	},
  'blur #start-datepicker' (event, template){
    var startDate = moment(template.find("#start-datepicker").value,'YYYY-MM-DD');
    if(!startDate.isValid()){
      Bert.alert('Start date needs to be valid','danger');
      $("#start-datepicker").val(moment().format('YYYY-MM-DD'));
    }
    var endDate = moment(template.find("#end-datepicker").value,'YYYY-MM-DD');
    if(moment(endDate).isSameOrBefore(startDate)){
      Bert.alert('End date is less than or same as start date');
      $("#end-datepicker").val(moment(startDate).add(1, 'year').format('YYYY-MM-DD'));
    }

  },
  'blur #end-datepicker' (event, template){
    var endDate = moment(template.find("#end-datepicker").value,'YYYY-MM-DD');
    if(!endDate.isValid()){
      Bert.alert('End date needs to be valid','danger');
      $("#end-datepicker").val(moment().add(2, 'week').format('YYYY-MM-DD'));
    }
  },
  'click .add-language' (event, template){
    event.preventDefault();
    let selectedLang = $("#available-languages").val();
    let langs = Template.instance().dict.get('languages');
    if(langs.indexOf(selectedLang)>=0){
      //Bert.alert("Language already set", 'danger');
    }else{
      langs.push(selectedLang);
      Template.instance().dict.set('languages',langs);
    }
  },
  'submit form': function(event, template){
		event.preventDefault();
		var settings = {
				colorScheme: template.find("#colorScheme").value,
				homepageImageUrl: template.find("#homepageImageUrl").value,
				homepageBannerText: template.find("#homepageBannerText").value,
				homepageIntroText: template.find("#homepageIntroText").value,
				aboutText: template.find("#aboutText").value,
				defaultLanguage: template.find("#defaultLanguage").value,
				languages: Template.instance().dict.get('languages'),
				languageSelector: template.find("#languageSelector").checked,
				emailWhitelist: template.find("#emailWhitelist").value.split(','),
				enforceWhitelist: template.find("#enforceWhitelist").checked,
        showDates: Template.instance().dict.get('showDates'),
        defaultStartDate: template.find("#start-datepicker").value,
        defaultEndDate: template.find("#end-datepicker").value
		}
    let communityId = LocalStore.get('communityId');

		Meteor.call('updateCommunity', communityId,settings, function(error){
			if (error){
				Bert.alert(error.reason, 'danger');
			} else {
				Bert.alert("Settings updated",'success');
			}
		});
	}
});
