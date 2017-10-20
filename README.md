# Common Democracy Beta

Beta version for Common Democracy app.

Common Democracy is an platform for facilitating the democracy of the commons.

> _IMPORTANT: Common Democracy is **still under development**, no official releases have been made yet.[ Beta Demo](http://www.commondemocracy.org)._

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Basic knowledge of JS, HTML and CSS. If you are not familiar with Node.js or Meteor applications, I recommend doing the following [tutorial](https://www.meteor.com/tutorials). Should take about 30min to get a basic understanding of the framework.

###Install Framework

On Linux & MacOS, load a terminal and type:

```sh $ curl https://install.meteor.com/ | sh```

This will setup [Meteor](http://github.com/meteor/meteor) (including [Node](https://github.com/nodejs/node) and [Mongo](https://github.com/mongodb/mongo) if necessary).
    
> _Note:_ Windows users must [download installer](https://www.meteor.com/install).

---

### Local setup


0. **Clone Repository**

    ```sh $ git clone https://commondemocracyadmin@bitbucket.org/commondemocracy/beta.git
    ```
    

0. **Install Dependencies**

	Go to appdirectory:
	
	```$ cd beta```

    If you have npm installed, type:

    ```sh
    $ npm install
    ```

    If you only have meteor, type:

    ```sh
    $ meteor npm install
    ```
0. **Modifiy App settings**

	The app has default settings you can configure before running.
	
	Set-up oAuth login credentials, (contact Brett if you need):
	
	```"private": {
    "oAuth": {
      "facebook": {
        "appId": "",
        "secret": ""
      },
      "github": {
        "clientId": "",
        "secret": ""
      },
      "google": {
        "clientId": "",
        "secret": ""
      },
      "twitter": {
        "consumerKey": "",
        "secret": ""
      }
    },```
	
	Setup default admin user details:
	
	```"defaultUsers": [
      {
          "username": "superadmin",
          "password": "superadmin"
          "first_name": "Brett",
          "last_name":"Jackman",
          "email":"brett@commondemocracy.org",
          "roles":["superadmin","admin","normal"]
      }```

	
0. **Run App**

    While in repository directory type:

    ```sh
    $ meteor npm run start
    ```
	This will load custom settings for development testing on localhost.
	For 
    
    Load browser and go to [http://localhost:3000/](http://localhost:3000/) 
     :boom:


### Live Demo

* Beta Site: [commondemocracy.org](http://www.commondemocracy.org).

---

##Features Roadmap

Here is an outline of the MVP features:


0.  **[-]  Registration: **
 	* [-] Email registration
 	* [x] FB registration
 	* [x] Google registration
 	* [-] Twitter registration
 	* [x] Dummy user generation
 	* [-] Admin Panel: User management
 	* [-] Roles & Permissions
 	* [-] User Profiles
 	
1.	**[-] Admin Panel CRUD **
 	* [x] User 
  	* [-] Delegates
  	* [-] Candidates
  	* [-] Organisations/Parties
  	* [-] Proposals
  	* [-] Votes
  	* [-] Reported Content (Proposals/Comments/Users)
  	* [-] Issues
  	
2. **[-] Proposal writing: **
 	* [x] Basic
 	* [-] Category Tags
 	* [x] Comments
 	* [x] Simple vote (yes/no)
 	* [-] Mulitiple vote options (custom)
 	* [-] Admin Panel: Proposal management

3. ** [x] Delegation. **
    * [x] Choose Delegates (People/Parties/Organisations)
    * [x] Rank Delegates (People/Parties/Organisations)
    * [-] Admin Panel: Delegate management
    	* [-] Political Party Management
    	* [-] 0rganisation Management
 
4. ** [-] Endorse. **
    * [-] Nominate Candidates
    * [-] Select Candidates
    * ...still to be updated
    
5. ** [-] Styling**
    * [-] Material design layout [Materialize]()
    * [-] Mobile & desktop responsive UX.
    * [-] [Webflow](https://www.webflow.com) anyone...?
    
6. ** [-] Dev-ops**
	* [-] MailGun set-up
	* [x] Slack Intergation on BitBucket
	* [-] Subdomains for Collectives
	* [-] CI Integration
	* [-] Bugsnag Integration
  

 
###Future Roadmap


0.  [-] Decentralized identity key management.
1.  [-] Blockchain inegration with [Ethereum](https://www.ethereum.org/dao)
2.  [-] Mobile App. [Ionic](https://ionicframework.com)
3.  [-] Native desktop client. [Electron](https://github.com/electron/electron)
4.  [-] Migrate to Apollo & GraphQL. [Vulcan](http://docs.vulcanjs.org/index.html)
5.  [-] Devops & Tracking:
	* [Climate](https://codeclimate.com)
	* [CII validation](https://bestpractices.coreinfrastructure.org)
	* ...

###Nice-To-Haves Roadmap

0. [-] Live chat.
1. [-] Custom styling for cliets using SAAS.
2. [-] API integration for external sites.

---

## Specifications

Built on [Meteor](https://www.meteor.com/) version 1.5.2

* Rapid cross platform deployment (web + desktop + mobile).
* Simple code structure.
* Fast and reliable stack (node + mongo).

Check our documentation for technical reference.

**Supported Browsers:**

| IE / Edge | Firefox | Chrome | Safari | iOS Safari | Chrome for Android |
| --------- | --------- | --------- | --------- | --------- | --------- |
| IE10, IE11, Edge| last 2 versions| last 4 versions| last 4 versions| last 4 versions| last 4 versions

---

##Running the tests
(Still to be done)

---
## Deployment

You will need to configure variables in ```/config/production/settings/json```

Speak to Brett for oAuth settings.

---

## Contributing

(Still to be done)
Please read CONTRIBUTING.md for details on our code of conduct, and the process for submitting pull requests to us. 

---
## Versioning
(Still to be done)
None as yet. Open to suggestions.
Thinking about [SemVer](http://semver.org/) for versioning. 

---
## Documentation
(Still to be done)
[Sphinx](http://www.sphinx-doc.org/en/stable/) me thinks? 

---
## Authors
* **Tim Olsen** - *Man with the plan* 
* **Brett Jackman** - *Code Monkey* 
* **Trudie Spanenberg - *Code Ninja*

---
## License

None so far

---
## Acknowledgments

* Hat tip to Democracy Earth for getting me started
* add your name here after your first commit... ;)

