import { Communities } from '../../api/communities/Communities.js'
import { _ } from 'meteor/underscore';

export const createTestCommunities = function () {
  if (Meteor.isServer) {
    console.log("is server");
  }else{
    console.log("is not server");
  }
  let globalId = getRootCommunityId();
  countries = getCountries();
  _.each(countries, function(country,index){
		let code = country["alpha-2"];
    let name = country["name"];
    let community = {
        name: name,
        key: code.toLowerCase(),
        subdomain: name.toLowerCase(),
        isRoot: false,
        parentCommunity: globalId,
        data: country,
        settings: {
          contactEmail: 'hello@crowdpol.com',
          colorScheme: 'default',
          languageSelector: true,
          defaultLanguage: 'en',
          languages: ['en','ja','cy','sv'],
          emailWhitelist: [],
          enforceWhitelist: true,
          showDates: true,
          delegateLimit: 5,
          collaboratorLimit: 5
        }
    };

		createCommunity(community)
	});
  return true;
};

export const getCountries = function (){
  /* FORMAT
  {
   "name":"Nigeria",
   "alpha-2":"NG",
   "alpha-3":"NGA",
   "country-code":"566",
   "iso_3166-2":"ISO 3166-2:NG",
   "region":"Africa",
   "sub-region":"Sub-Saharan Africa",
   "intermediate-region":"Western Africa",
   "region-code":"002",
   "sub-region-code":"202",
   "intermediate-region-code":"011"
 }
 */
  var countries = require('./countries/iso-3166.json');
  return countries;
}

function getRootCommunityId(){
  var existing = Communities.findOne({$or: [{name: 'Crowdpol Global'},{subdomain: 'global'},{key: 'Global'}]});
	if (!existing){
		return createGlobalCommunity();
	} else {
		console.log('Global root community already exists.');
		return existing._id;
	}
}



function createGlobalCommunity(){
  let globalCommunity = {
      name: 'Crowdpol Global',
      key: 'Global',
      subdomain: 'global',
      isRoot: true,
      parentCommunity: '',
      settings: {
        contactEmail: 'hello@crowdpol.com',
        colorScheme: 'default',
        logoUrl: '',//URL,
        faviconUrl: 'img/syntropi_grey.jpg',
        homepageImageUrl: 'img/syntropi_grey.jpg',
        homepageBannerText: 'A new wave of democracy is coming.',
        homepageIntroText: 'A liquid democracy platform for the collective decision making in the commons.',
        aboutText: 'Crowdpol about us page',
        languageSelector: true,
        defaultLanguage: 'en',
        languages: ['en','ja','cy','sv'],
        emailWhitelist: [],
        enforceWhitelist: true,
        showDates: true,
        delegateLimit: 5,
        collaboratorLimit: 5
      }
  };
  return createCommunity(globalCommunity);
}

function createCommunity(community){
	var existing = Communities.findOne({$or: [{name: community.name},{subdomain: community.subdomain},{key: community.key}]});
	if (!existing){
		console.log('Creating community ' + community.name);
		return Communities.insert(community);

	} else {
		console.log(community.name + ' Community already exists.')
		return existing._id;
	}
}
