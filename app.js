let Alexa = require('alexa-remote2');
let alexa = new Alexa();
var express = require('express')
, request = require('request')
, routes = require('routes')
, user = require('user')
, http = require('http')
, Cryptr = require('cryptr')
, LocalStorage = require('node-localstorage').LocalStorage
, path = require('path');

const cryptr = new Cryptr('Danc1ngonaPin');
var localStorage = new LocalStorage('/scratch'); 
var deviceNames = [];
var apiInitialized = false;
var app = express();
app.locals.moment = require('moment');

//all environments

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

/***************************************************************/
// see: https://www.gehrig.info/alexa/Alexa.html
// cookie starts with x-amzn-dat and ends with =" csrf=12345780
let cookie = {};
console.log("Device Serial: "+localStorage.getItem("deviceserial"))
var username,password='';
try{username = cryptr.decrypt(localStorage.getItem("urtopic"))}
	catch(error){username=''}
try{password = cryptr.decrypt(localStorage.getItem("prtopic"))}
	catch(error){password=''}

alexa.init({
        cookie: cookie,  // cookie if already known, else can be generated using email/password
        email: username,    // optional, amazon email for login to get new cookie
        password: password, // optional, amazon password for login to get new cookie
        proxyOnly: false,
        proxyOwnIp: 'localhost',
        proxyPort: 3001,
        proxyLogLevel: 'info',
        amazonPageProxyLanguage: 'en_US',
        formerRegistrationData:{
       	   deviceSerial: localStorage.getItem("deviceserial") == null ? "" : localStorage.getItem("deviceserial")
        },
        bluetooth: true,
        logger: console.log, // optional
        alexaServiceHost: 'alexa.amazon.com', // optional, e.g. "pitangui.amazon.com" for amazon.com, default is "layla.amazon.de"
//      userAgent: '...', // optional, override used user-Agent for all Requests and Cookie determination
        acceptLanguage: 'en-US', // optional, override Accept-Language-Header for cookie determination
        amazonPage: 'amazon.com', // optional, override Amazon-Login-Page for cookie determination and referer for requests
        useWsMqtt: false, // optional, true to use the Websocket/MQTT direct push connection
        refreshCookieInterval: 0 // optional, cookie refresh interval, set to 0 to disable refresh
    },
    function (err) {
        if (err) {
            console.log (err);
            return;
        }
        alexa.getDevices(function(err,result){
            if (!err && result && Array.isArray(result.devices)) {
            	deviceNames = [];
            	result.devices.forEach(function(device){
                    if (device.capabilities.includes('EARCONS') && device.capabilities.includes('MICROPHONE'))
                    	deviceNames.push(device.accountName)	
            	});
            	if (localStorage.getItem("deviceserial") == null) //get serial number of new device
            		for(var x=result.devices.length; x > 0; x--)
            			if (result.devices[x-1].appDeviceList.length > 0)
            				for (var y = result.devices[x-1].appDeviceList.length; y > 0; y--)
            					if (result.devices[x-1].appDeviceList[y-1].deviceType === "A2IVLV5VM2W81"){
            				        localStorage.setItem("deviceserial",result.devices[x-1].appDeviceList[y-1].serialNumber);
            				        console.log("Alexa-Speaks: New device created.  Serial number is "+result.devices[x-1].appDeviceList[y-1].serialNumber);
            				        break;
            			        }
            	
                apiInitialized = true
            }
            else
               apiInitialized = true
        });
    }
);
//process...
app.get('/init', function (req, res) {
    res.locals.err = false;
	alexa.init({
        cookie: cookie,  // cookie if already known, else can be generated using email/password
        proxyOnly: false,
        proxyOwnIp: 'localhost',
        proxyPort: 3001,
        proxyLogLevel: 'info',
        amazonPageProxyLanguage: 'en_US',
        bluetooth: true,
        logger: console.log, // optional
        alexaServiceHost: 'pitangui.amazon.com', // optional, e.g. "pitangui.amazon.com" for amazon.com, default is "layla.amazon.de"
        acceptLanguage: 'en-US', // optional, override Accept-Language-Header for cookie determination
        amazonPage: 'amazon.com', // optional, override Amazon-Login-Page for cookie determination and referer for requests
        useWsMqtt: false, // optional, true to use the Websocket/MQTT direct push connection
        refreshCookieInterval: 0 // optional (in ms 7*24*60*60*1000 = 7 days cookie refresh interval, set to 0 to disable refresh
    },
    function (err) {
        if (err) {
 		   console.log("Alexa-Speaks: "+err);
		   res.locals.err = true;
        }
    })
    setTimeout(function(){
	    res.render('apiresponse',{apiInitialized: apiInitialized,error: res.locals.err})
    }, 2000);  // wait for any errors to accumulate
})

app.get('/speak', function (req, res) {
	res.locals.text = req.query.text;
	res.locals.err = false
	var who = typeof req.query.who == 'undefined' ? 'all' : req.query.who
	var svars = who.split(',')
	if (who == 'all')
		for (var x = 0 ; x < deviceNames.length; x++)
			   alexa.sendSequenceCommand(deviceNames[x],'speak',res.locals.text,function(err){
		    	   if (err && err.search("COnnection" != -1)){
		    		   console.log("Alexa-speaks: "+err);
		    		   res.locals.err = true;
		    	   }
		       });
	else
	   for (var x = 0 ; x < svars.length; x++)
		      alexa.sendSequenceCommand(deviceNames[parseInt(svars[x],10)-1],'speak',res.locals.text,function(err){
		    	   if (err){
		    		      console.log("Alexa-Speaks: "+err);
		    		      res.locals.err = true;
		    	   }
	          });
    setTimeout(function(){
	    res.render('apiresponse',{apiInitialized: apiInitialized,error: res.locals.err})
    }, 2000);  // wait for any errors to accumulate
	
})
app.get('/announce', function (req, res) {
	res.locals.text = req.query.text;
	var who = typeof req.query.who == 'undefined' ? 'all' : req.query.who
	var svars = who.split(',')
	if (who == 'all')
		for (var x = 0 ; x < deviceNames.length; x++)
			   alexa.sendSequenceCommand(deviceNames[x],'announcement',res.locals.text,function(err){
		    	   if (err)
		    		   console.log(err);
		       });
	else
	   for (var x = 0 ; x < svars.length; x++)
		      alexa.sendSequenceCommand(deviceNames[parseInt(svars[x],10)-1],'announcement',res.locals.text,function(err){
	    	      if (err)
	    		      console.log(err);
	          });
    res.render('apiresponse',{apiInitialized: apiInitialized})
})
app.get('/', function (req, res) {
	var response = typeof req.query.response != 'undefined' ? req.query.response : ''
	var username,password='';
	try{username = cryptr.decrypt(localStorage.getItem("urtopic"))}
	catch(error){username=''}
	try{password = cryptr.decrypt(localStorage.getItem("prtopic"))}
	catch(error){password=''}
    res.render('defaultresponse',{username: username, password: password, response: response, deviceNames: deviceNames, apiInitialized: apiInitialized});
})

app.get('/getdevices', function (req, res) {
	res.locals.redirect = req.query.redirect
	if (apiInitialized)
       alexa.getDevices(function(err,result){
           if (!err && result && Array.isArray(result.devices)) {
        	   deviceNames=[];
        	   result.devices.forEach(function(device){
                   if (device.capabilities.includes('EARCONS') && device.capabilities.includes('MICROPHONE'))
                	   deviceNames.push(device.accountName)	
        	   });
           }
       	   alexa.init({
               cookie: cookie,  // cookie if already known, else can be generated using email/password
               proxyOnly: false,
               proxyOwnIp: 'localhost',
               proxyPort: 3001,
               proxyLogLevel: 'info',
               amazonPageProxyLanguage: 'en_US',
               bluetooth: true,
               logger: console.log, // optional
               alexaServiceHost: 'alexa.amazon.com', // optional, e.g. "pitangui.amazon.com" for amazon.com, default is "layla.amazon.de"
               acceptLanguage: 'en-US', // optional, override Accept-Language-Header for cookie determination
               amazonPage: 'amazon.com', // optional, override Amazon-Login-Page for cookie determination and referer for requests
               useWsMqtt: false, // optional, true to use the Websocket/MQTT direct push connection
               refreshCookieInterval: 0 // optional, cookie refresh interval, set to 0 to disable refresh
           },
           function (err) {
               if (err) {
     		      console.log("Alexa-Speaks: "+err);
               }
           })
           return res.redirect(res.locals.redirect)
       });
	else
        return res.redirect(res.locals.redirect)
})
app.post('/savecredentials',function (req,res){
	localStorage.setItem('urtopic',cryptr.encrypt(req.body.email));
	localStorage.setItem('prtopic',cryptr.encrypt(req.body.password));
	res.locals.redirect = req.body.redirect
	return res.redirect(res.locals.redirect+'?response=Credentials Updated')
	
})//Start up server

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

