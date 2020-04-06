import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Proposals } from '../../api/proposals/Proposals.js'
import { Maps } from '../../api/maps/Maps.js'
import { createTestCommunities } from '../../utils/test-data/test-communities.js'
import { Communities } from '../../api/communities/Communities.js'

Meteor.startup(() => {
  createTestCommunities();
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
  let globalId = createCommunity(globalCommunity);
  let swedishCommunity = {
	    name: 'Sweden',
			key: 'SE',
	    subdomain: '',
	    isRoot: false,
	    parentCommunity: globalId,
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
				defaultLanguage: 'sv',
				languages: ['en','sv'],
				emailWhitelist: [],
				enforceWhitelist: true,
				showDates: true,
				delegateLimit: 5,
				collaboratorLimit: 5
			}
	};
	let swedenId = createCommunity(swedishCommunity);

	let southAfricaCommunity = {
	    name: 'South Africa',
	    subdomain: '',
			key: 'ZA',
	    isRoot: false,
	    parentCommunity: globalId,
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
				defaultLanguage: 'sv',
				languages: ['en','sv'],
				emailWhitelist: [],
				enforceWhitelist: true,
				showDates: true,
				delegateLimit: 5,
				collaboratorLimit: 5
			}
	};
	let southAfricaId = createCommunity(southAfricaCommunity);

  registerAdmins([globalId]);
  registerCountries(globalId,swedenId,southAfricaId);

});

function registerAdmins(communityIds){
	var admins = Meteor.settings.private.admins;
	for(var x = 0; x < admins.length; x++){
		createAdmins(admins[x], communityIds);
	}
}

createAdmins = function (admin, communityIds) {
	if (!Accounts.findUserByEmail(admin.email)){
		var id = Accounts.createUser({
			username: admin.username,
			email : admin.email,
			password : "123456",
			isPublic: admin.isPublic,
			profile: {
				communityIds: communityIds,
				adminCommunities: communityIds,
				username: admin.profile.username,
				firstName: admin.profile.firstName,
				lastName: admin.profile.lastName,
				photo: admin.profile.photo,
				termsAccepted: true,
				credentials : [
				{
					"source" : "default",
					"URL" : "https://www.crowdpol.org/",
					"validated" : true
				}
				],
				termsAccepted: true
			}
		});

		if (admin.roles.length > 0) {
		    // Need _id of existing user record so this call must come
		    // after `Accounts.createUser` or `Accounts.onCreate`
		    Roles.addUsersToRoles(id, admin.roles);
		}
		console.log('Created admin ' + admin.email);
	} else {
		console.log('Admin with email ' + admin.email + ' already exists.')
	}
};

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
function registerCountries(global){

	let maps = [
	  {
	    "type": "Feature",
	    "properties": {
				"name": "Sweden",
	      "key":"SE",
	      "rootMap":"GLOBAL",
	      "communityId":"",
	      "rootCommunityId":global
	    },
	    "geometry": {
	      "type": "Polygon",
	      "coordinates":[[[22.183173455501926,65.72374054632017],[21.21351687997722,65.02600535751527],[21.369631381930958,64.41358795842429],[19.77887576669022,63.60955434839504],[17.84777916837521,62.74940013289681],[17.119554884518124,61.34116567651097],[17.83134606290639,60.63658336042741],[18.78772179533209,60.081914374422595],[17.86922488777634,58.9537661810587],[16.829185011470088,58.71982697207339],[16.447709588291474,57.041118069071885],[15.879785597403783,56.10430186626866],[14.666681349352075,56.200885118222175],[14.100721062891465,55.40778107362265],[12.942910597392057,55.36173737245058],[12.625100538797028,56.30708018658197],[11.787942335668674,57.44181712506307],[11.027368605196866,58.85614940045936],[11.468271925511146,59.43239329694604],[12.3003658382749,60.11793284773003],[12.631146681375183,61.293571682370136],[11.992064243221563,61.80036245385656],[11.93056928879423,63.12831757267698],[12.579935336973932,64.06621898055833],[13.571916131248711,64.04911408146971],[13.919905226302204,64.44542064071608],[13.55568973150909,64.78702769638151],[15.108411492583002,66.19386688909547],[16.108712192456778,67.30245555283689],[16.768878614985482,68.01393667263139],[17.729181756265348,68.01055186631628],[17.993868442464333,68.56739126247736],[19.878559604581255,68.40719432237258],[20.025268995857886,69.0651386583127],[20.645592889089528,69.10624726020087],[21.978534783626117,68.6168456081807],[23.53947309743444,67.93600861273525],[23.565879754335583,66.39605093043743],[23.903378533633802,66.00692739527962],[22.183173455501926,65.72374054632017]]]
	    }
	  },
	  {
	    "type": "Feature",
	    "properties": {
				"name": "South Africa",
	      "key":"ZA",
	      "rootMap":"GLOBAL",
	      "communityId":"",
	      "rootCommunityId":global
	    },
	    "geometry": {
	      "type": "Polygon",
	      "coordinates": [[[31.521001417778876,-29.257386976846252],[31.325561150851,-29.401977634398914],[30.901762729625343,-29.90995696382804],[30.622813348113823,-30.42377573010613],[30.05571618014278,-31.140269463832958],[28.925552605919535,-32.17204111097249],[28.2197558936771,-32.771952813448856],[27.464608188595975,-33.2269637997788],[26.419452345492825,-33.61495045342619],[25.90966434093349,-33.6670402971764],[25.780628289500697,-33.944646091448334],[25.172861769315972,-33.796851495093584],[24.677853224392123,-33.98717579522455],[23.594043409934642,-33.794474379208154],[22.988188917744733,-33.91643075941698],[22.574157342222236,-33.864082533505304],[21.542799106541025,-34.258838799782936],[20.689052768647002,-34.417175388325234],[20.071261020597632,-34.79513681410799],[19.61640506356457,-34.81916635512371],[19.193278435958717,-34.46259897230979],[18.85531456876987,-34.444305515278465],[18.42464318204938,-33.99787281670896],[18.377410922934615,-34.13652068454807],[18.244499139079917,-33.86775156019802],[18.250080193767445,-33.28143075941444],[17.92519046394844,-32.61129078545343],[18.247909783611192,-32.42913136162456],[18.22176150887148,-31.66163298922567],[17.56691775886887,-30.725721123987547],[17.064416131262703,-29.87864104585916],[17.062917514726223,-29.875953871379984],[16.344976840895242,-28.576705010697697],[16.824017368240902,-28.082161553664466],[17.218928663815404,-28.35594329194681],[17.387497185951503,-28.78351409272978],[17.83615197110953,-28.85637786226132],[18.464899122804752,-29.04546192801728],[19.002127312911085,-28.972443129188864],[19.894734327888614,-28.461104831660776],[19.895767856534434,-24.767790215760588],[20.165725538827186,-24.917961928000768],[20.758609246511835,-25.86813648855145],[20.66647016773544,-26.477453301704923],[20.88960900237174,-26.828542982695915],[21.60589603036939,-26.726533705351756],[22.105968865657868,-26.280256036079138],[22.57953169118059,-25.979447523708146],[22.8242712745149,-25.500458672794768],[23.312096795350186,-25.26868987396572],[23.73356977712271,-25.390129489851613],[24.211266717228792,-25.670215752873574],[25.025170525825786,-25.7196700985769],[25.66466637543772,-25.486816094669713],[25.76584882986521,-25.174845472923675],[25.94165205252216,-24.69637338633322],[26.4857532081233,-24.616326592713104],[26.786406691197413,-24.240690606383485],[27.119409620886245,-23.574323011979775],[28.01723595552525,-22.827753594659075],[29.43218834810904,-22.091312758067588],[29.839036899542972,-22.102216485281176],[30.322883335091774,-22.27161183033393],[30.65986535006709,-22.151567478119915],[31.191409132621285,-22.2515096981724],[31.670397983534652,-23.658969008073864],[31.93058882012425,-24.369416599222536],[31.75240848158188,-25.484283949487413],[31.837777947728064,-25.84333180105135],[31.333157586397906,-25.66019052500895],[31.04407962415715,-25.731452325139443],[30.949666782359913,-26.022649021104147],[30.676608514129637,-26.398078301704608],[30.68596194837448,-26.74384531016953],[31.282773064913325,-27.285879408478998],[31.868060337051077,-27.177927341421277],[32.07166548028107,-26.73382008230491],[32.830120477028885,-26.742191664336197],[32.580264926897684,-27.470157566031816],[32.46213260267845,-28.301011244420557],[32.20338870619304,-28.752404880490072],[31.521001417778876,-29.257386976846252]]]
	    }
	  }
	];
	_.each(maps, function(map,index){
		//console.log("Community count: " + Communities.find().count());
		//console.log("Community key count: " + Communities.find({"key":map.properties.key}).count());
		let existingCommunity = Communities.findOne({"key":map.properties.key});
		if(existingCommunity){
			map.properties.communityId = existingCommunity._id;
			Meteor.call('addMap', map)
		}else{
			console.log("cannot find community with key: " + map.properties.key);
		}

	});
}
