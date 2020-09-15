
# alexa-speaks

website REST api that implements TTS via Alexa announce feature.


<!--
[![NPM version](http://img.shields.io/npm/v/alexa-remote.svg)](https://www.npmjs.com/package/alexa-remote)
[![Tests](http://img.shields.io/travis/soef/alexa-remote/master.svg)](https://travis-ci.org/soef/alexa-remote)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/soef/alexa-remote/blob/master/LICENSE)
-->

## Installation

Full installation instructions for Windows based machines can be found in the document "Installing Alexa Speaks.pdf"

## Execution

node.js must be installed.  Then run as follows:

node /alexa-speaks/app.js


## Usage

### Access the proxy site to get a valid amazon cookie on initial execution:

http://localhost:3001

You will be taken to an alexa.com login page.  Log in and solve any Capcha that might be displayed.  Successful login will capture a valid session cookie for subsequent use.

### Access the management site:

http://localhost:3000

View a list of your devices so you know which number in the "who" parameter below to use for which device.  Press "Update Device list" if you have updated or renamed your devices.

### Access the site for all api calls once a valid cookie has been obtained:

http://localhost:3000/[endpoint]?[variable1]=[value]&[variable2]=[value]

| endpoint  | variable1 | value | variable2 | value | description |
|-----------|-----------| :---: | --- | :---: | --- |
| speak | text | the text to speak | who | "all" or 1,2 or 2,3,4 etc | cause selected echo devices to speak the text |
| announce | text | the text to speak | who | "all" or 1,2 or 2,3,4 etc | cause selected echo devices to announce the text (announce tone and green ring precedes text) |
| init | | | | | re-initialize the api |


## Thanks:
alexa-speaks is mostly a web wrapper around [alexa-remote2](https://github.com/Apollon77/alexa-remote) by Apollon77

Partly based on [Amazon Alexa Remote Control](http://blog.loetzimmer.de/2017/10/amazon-alexa-hort-auf-die-shell-echo.html) (PLAIN shell) and [alexa-remote-control](https://github.com/thorsten-gehrig/alexa-remote-control) and [OpenHab-Addon](https://github.com/openhab/openhab2-addons/blob/f54c9b85016758ff6d271b62d255bbe41a027928/addons/binding/org.openhab.binding.amazonechocontrol)

Thank you for that work.

## Known issues/Todos
* none. 

## Changelog:

### 1.7
* Update alexa-remote for new Amazon proxy handshake.  Fixes "enable cookie on your browser" issue

### 1.6
* change alexa-remote to be a dependency of apollon7/alexa-remote2.

### 1.5
* Alexa-speakes requires a device for use with amazon.  Re-use this device on subsequent execution
* added option to enter amazon credentials on the default page (WIP: only encrypted store logic complete.  not actually used yet)
* added local storage option to store device serial and credentials (encrypted) in \scratch directory

### 1.4
* trap any sendSequenceCommand errors and show in api response

### 1.3
* add additional "announce" and "init" api endpoints
* fix refresh cookie interval.  Cookie refresh is now set to 12 hours.

### 1.2
* inhibit api/management functions until initialization completes
* show error message on management interface if api is not initialized

### 1.1.1
* devicelist moved to default page (localhost:3000).  
* Added version number to default page
* Added "Update Device List" button to default page

### 1.1
* Enumerate devices
* Show "who" parameter mapping on /devicelist page

### 1.0
* Initial release by Sleuth255
