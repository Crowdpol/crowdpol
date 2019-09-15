import './footer.html';
import {updateHeaderMenu} from '../../pages/communities/communityDash.js';

Template.Footer.events({
	'click .bottom-nav-link': function(event, template){
    //console.log(event.currentTarget.dataset);
    updateHeaderMenu(event.currentTarget.dataset.id);
    event.currentTarget.className += " active";
	}
});
