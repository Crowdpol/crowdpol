import { _ } from 'meteor/underscore';

export const buildRegExp = function (searchText) {
  const words = searchText.trim().split(/[ \-:]+/);
  const exps = _.map(words, function(word) {
    return `(?=.*${word})`;
  });
  const fullExp = exps.join('') + '.+';
  return new RegExp(fullExp, 'i');
};

// converts a String to slug-like-text.
export const convertToSlug = (text) => {
  if (text !== undefined) {
    return text
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^a-zA-Z0-9àâäèéêëîïôöœùûüÿçÀÂÄÈÉÊËÎÏÔŒÙÛÜŸÇ\-]+/g, '')
        ;
  }
  return undefined;
};

//first Letter Caps aka Title Case
export const titleCase = (string) => {
  if(string){
    var splitStr = string.toLowerCase().split(' ');
     for (var i = 0; i < splitStr.length; i++) {
         // You do not need to check if i is larger than splitStr length, as your for does that for you
         // Assign it back to the array
         splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
     }
     // Directly return the joined string
     return splitStr.join(' ');
  }
  return false;
}

//IntroJs tutorial guide
export const walkThrough = (steps) => {
  var intro = introJs();
  intro.setOptions({
    steps: steps
  });
  intro.start();
}

export const timeRemaining = (finalDate) => {
    var eventdate = moment(finalDate);
    var todaysdate = moment();
    return eventdate.diff(todaysdate, 'days');
}

export const daysRemaining = (finalDate) => {
    var eventdate = moment(finalDate);
    var todaysdate = moment();
    return eventdate.diff(todaysdate, 'days');
}

//function to check if object has key
export const hasOwnProperty = (obj,prop) => {
  var proto = obj.__proto__ || obj.constructor.prototype;
  return (prop in obj) && (!(prop in proto) || proto[prop] !== obj[prop]);
}

export const urlify = (text) => {
  console.log("urlify called: " + text);
  var urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function(url) {
    return '<a href="' + url + '" target="_blank">link</a>';
  });
}
