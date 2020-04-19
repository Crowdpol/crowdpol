# Crowdpol

Alpha version for Crowdpol app.

Crowdpol is an platform for facilitating the democracy of the commons.

> _IMPORTANT: Crowdpol is **still under development**, no official releases have been made yet.[ Beta Demo](http://www.crowdpol.com)._

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Basic knowledge of JS, HTML and CSS. If you are not familiar with Node.js or Meteor applications, I recommend doing the following [tutorial](https://www.meteor.com/tutorials). Should take about 30min to get a basic understanding of the framework.

**Install Meteor JS on your machine** 

For latest instructions visit  [Meteor JS website](https://www.meteor.com/install)

On Linux & MacOS, load a terminal and type:

```sh $ curl https://install.meteor.com/ | sh```

This will setup [Meteor](http://github.com/meteor/meteor) (including [Node](https://github.com/nodejs/node) and [Mongo](https://github.com/mongodb/mongo) if necessary).

> _Note:_ On Windows machines: first install [Chocolatey](https://chocolatey.org/install), then run this command using an Administrator command prompt:
```choco install meteor```
---

### Local setup


 **Install Dependencies**
	Navigate to app directory:

```sh $ cd crowdpol```


**[YARN](https://yarnpkg.com/) (Recomended)**
	The command below gets you set up locally, see yarn docs for [global install](https://yarnpkg.com/getting-started/install#global-install) 
		
	```meteor npm install -g yarn ```
		
sets up dependencies

	```yarn```

Start Application at http://global.localhost:3000

		```yarn start``` 

**NPM (may be buggy)**

	
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

	Setup default admin user details:

	 
```sh
    "admins": [
    	    {
    	        "username": "your_username",
    	        "email":"your@emailaddress.com",
    	        "roles":["superadmin", "admin","individual"],
    	        "isPublic": true,
    	        "profile": {
    	          "username": "your_username",
    	          "firstName": "Your_Firstname",
    	          "lastName": "Your_Lastname",
    	          "organization": "Organisation_Name",
    	          "bio": "Systems administrator",
    	          "photo": "/img/default-user-image.png"
    	        }
    	    }
    	]
```
	

0. **Run App**

    While in repository directory type:

    ```sh
    $ yarn start
    ```
	This will load custom settings for development testing on localhost.
	For

    Load browser and go to [http://crowdpol.localhost:3000/](http://crowdpol.localhost:3000/)
     :boom:

---
## Tests

To run tests on port 8000:

```yarn test```

For more details see [Test ](https://github.com/Crowdpol/crowdpol/wiki/Testing) section of Wiki

---

### Live Demo
* Staging Server [staging.crowpdol.com](https://staging.crowdpol.com)
* Production Server: [crowdpol.com](https://www.crowdpol.com).
> _NB:_ Production Server is still in alpha mode, there are no official GDPR or similar policies, T&C's in place. The developers are NOT responsible for the hosting of user data, that responsibility lies with 
Syntropi NGO: 
Syntropy  
Hammarby quay 10D,  
120 30  
Stockholm
[info@syntropi.se](mailto:info@syntropi.se)

## Specifications

Built on [Meteor](https://www.meteor.com/) version 1.6

* Rapid cross platform deployment (web + desktop + mobile).
* Simple code structure.
* Fast and reliable stack (node + mongo).

Check the [documentation](https://docs.meteor.com/v1.6/) for technical reference.

**Supported Browsers:**

| IE / Edge | Firefox | Chrome | Safari | iOS Safari | Chrome for Android |
| --------- | --------- | --------- | --------- | --------- | --------- |
| IE10, IE11, Edge| last 2 versions| last 4 versions| last 4 versions| last 4 versions| last 4 versions

---

## Deployment

You will need to configure variables in ```/config/production/settings/json```

For more details see [Deployment ](https://github.com/Crowdpol/crowdpol/wiki/Testing) section of Wiki

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
Suggestions: 
[Docusaurus](https://docusaurus.io/)
[Sphinx](http://www.sphinx-doc.org/en/stable/)


---
## License
This code is managed by Swedish NGO [Syntropi](http://syntropi.se/) 

Syntropy  
Hammarby quay 10D,  
120 30  
Stockholm

[info@syntropi.se](mailto:info@syntropi.se)

Apache License Version 2.0

---
## Acknowledgments

* Hat tip to [Democracy Earth](https://github.com/DemocracyEarth) for getting us started

