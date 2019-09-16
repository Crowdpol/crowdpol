import './footer.html';
import {loadCommunitySection} from '../../pages/communities/communityDash.js';

Template.Footer.events({
	'click .bottom-nav-link': function(event, template){
    //console.log(event.currentTarget.dataset);
		event.currentTarget.className += " active";
		var pathname = window.location.pathname;
		//console.log(pathname);
		var pathnames = pathname.split('/');
		if(pathnames[1]=='dash'){
			//console.log("root path is dash, call updateHeaderMenu");
			loadCommunitySection(event.currentTarget.dataset.id);
		}else{
			//console.log("root path is not dash, load dash");
			let routeStr = '/dash/' + event.currentTarget.dataset.id;
			//console.log(routeStr);
			FlowRouter.go(routeStr);
		}
		/*
		console.log("pathnames[0]: " + pathnames[0]);
		console.log("pathnames[1]: " + pathnames[1]);
		if(Array.isArray(pathnames)){
			console.log(pathnames[0]);
	    if(pathnames.length>1){
				console.log(pathnames[1]);
	      //let selection = pathnames[2];
	    }
	  }else{
	    console.log("pathnames is not array");
	  }
		console.log(pathnames);

		let routeStr = '/dash/' + event.currentTarget.dataset.id;
		console.log(routeStr);
		FlowRouter.go(routeStr);
		*/
	}
});
