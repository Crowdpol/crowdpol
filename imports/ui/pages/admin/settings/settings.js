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
        dict.set( 'showDates', settings.showDates);
        dict.set( 'startDate', moment(settings.defaultStartDate).format('YYYY-MM-DD') || defaultStartDate );
        dict.set( 'endDate', moment(settings.defaultEndDate).format('YYYY-MM-DD') || defaultEndDate);
        dict.set( 'colorScheme', settings.colorScheme || 'default');
        dict.set( 'logoUrl', settings.logoUrl || null);
        dict.set( 'faviconUrl', settings.faviconUrl || null);
        dict.set( 'homepageImageUrl', settings.homepageImageUrl || "img/wave-bg.jpg");
        dict.set( 'homepageBannerText', settings.homepageBannerText || null);
        dict.set( 'homepageIntroText', settings.homepageIntroText  || null);
        dict.set( 'aboutText', settings.aboutText || null);
        dict.set( 'languageSelector', settings.languageSelector);
        dict.set( 'defaultLanguage', settings.defaultLanguage || null);
        dict.set( 'languages', settings.languages || []);
        dict.set( 'emailWhitelist', settings.emailWhitelist || []);
        dict.set( 'enforceWhitelist', settings.enforceWhitelist);
        setupParameters(self);
      });
    }

  });
});

Template.AdminSettings.onRendered(function(){


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
  logoUrl: function(){
    return Template.instance().dict.get('logoUrl');
  },
  faviconUrl: function(){
    return Template.instance().dict.get('faviconUrl');
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
      //Bert.alert('Start date needs to be valid','danger');
      $("#start-datepicker").val(moment().format('YYYY-MM-DD'));
    }
    var endDate = moment(template.find("#end-datepicker").value,'YYYY-MM-DD');
    if(moment(endDate).isSameOrBefore(startDate)){
      //Bert.alert('End date is less than or same as start date','danger');
      $("#end-datepicker").val(moment(startDate).add(1, 'year').format('YYYY-MM-DD'));
    }

  },
  'blur #end-datepicker' (event, template){
    var endDate = moment(template.find("#end-datepicker").value,'YYYY-MM-DD');
    if(!endDate.isValid()){
      //Bert.alert('End date needs to be valid','danger');
      $("#end-datepicker").val(moment().add(2, 'week').format('YYYY-MM-DD'));
    }
    var startDate = moment(template.find("#start-datepicker").value,'YYYY-MM-DD');
    if(moment(startDate).isSameOrAfter(endDate)){
      //Bert.alert('End date is less than or same as start date','danger');
      $("#end-datepicker").val(moment(startDate).add(1, 'year').format('YYYY-MM-DD'));
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
        logoUrl: template.find("#logoUrl").value,
        faviconUrl: template.find("#faviconUrl").value,
        //faviconType: template.find("#faviconType").value,
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

function setupParameters(template){
  //set dates
  let showDates = template.dict.get('showDates');
  if(showDates==true){
    $("#user-dates").prop('checked',true);
    $('#static-dates').prop('checked',false);
    $("#setDates").hide();
  }else{
    $("#user-dates").prop('checked',false);
    $('#static-dates').prop('checked',true);
    $("#setDates").show()
  }
  $('#start-datepicker').val(moment(template.dict.get('startDate')).format('YYYY-MM-DD'))
  $('#end-datepicker').val(moment(template.dict.get('endDate')).format('YYYY-MM-DD'))
  $('#end-datepicker').datepicker({ dateFormat: 'yy-mm-dd' });
  $('#start-datepicker').datepicker({ dateFormat: 'yy-mm-dd' });


  //set language options
  $("#languageOptions").hide();
  let languageSelector = template.dict.get('languageSelector');
  if(languageSelector==true){
    $("#languageSelector").prop('checked', true);
    $("#languageOptions").show()
  }else{
    $("#languageSelector").prop('checked', false);
    $("#languageOptions").hide()
  }
  //setup whitelist
  let enforceWhitelist = template.dict.get('enforceWhitelist');
  if(enforceWhitelist==true){
    $("#enforceWhitelist").prop('checked', true);
    $("#emailWhitelistContainer").show()
  }else{
    $("#enforceWhitelist").prop('checked', false);
    $("#emailWhitelistContainer").hide()
  }
  var mdlInputs = document.querySelectorAll('.mdl-js-textfield');
  for (var i = 0, l = mdlInputs.length; i < l; i++) {
    mdlInputs[i].MaterialTextfield.checkDirty();
  }
}
