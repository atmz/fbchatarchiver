// 'irc' short name creator helper functions
 function makeIrcName(name) {
 	var ircName = "";
 	var words = name.split(" ");
 	var firstName = words[0];
 	ircName = firstName.toLowerCase();
 	return ircName;
 }
 function makeIrcNameInitial(name) {
 	var ircName = "";
 	var words = name.split(" ");
 	var firstName = words[0];
	if(words.length>1)
	{
 		ircName = firstName.toLowerCase() + words[1].charAt(0);
	}
 	return ircName;
 }
 function makeIrcNameFull(name) {
 	var ircName = "";
 	var words = name.split(" ");
 	var firstName = words[0];
	if(words.length>1)
	{
 		ircName = firstName.toLowerCase() +"_" +words[1].toLowerCase();
	}
 	return ircName;
 }
 
 
 //take a UUID and a full name and lookup the matching short name or create one if needed
 function idToName(id, name)
 {
	 if(id in state.idToName)
	 {
		 return state.idToName[id];
	 }
	 //else we need to create a name
	 var ircName = makeIrcName(name);
	 if(ircName in state.names) //check if name taken
	 {
		 ircName = makeIrcNameInitial(name);
	 }
	 if(ircName in state.names)
	 {
		 ircName = makeIrcNameFull(name);
	 }
	 //worst case - two people with same full name. This will rarely happen
	 for(var i=0; ircName in state.names; i++)
	 {
		 ircName = makeIrcNameFull(name) + i;
	 }
	 state.idToName[id] = ircName;
	 state.names[ircName] = id;
     return ircName;
 }
 


 function formatDatetime(datetime) {
 	var words = datetime.split("+");
 	var result = words[0];
 	result = result.replace("T","-");
 	return result;
 }


function clearAndProcessThread() {
	document.getElementById('chat').innerHTML="";
	document.getElementById("loading").style.visibility='visible';
	document.getElementById("saveThread").style.visibility='hidden';
	state.nextThreadPage = undefined;
	state.firstMessage = undefined;
	return processThread;
}
 function processThread(response) {
 		var chat = document.getElementById("chat").innerHTML;
		var tempChat = "";
 		console.log(response);
 		if (state.nameList == undefined  && 'to' in response) {
			generateNameList(response.to.data)
		}
 		if ('comments' in response) {
 			var thread = response.comments;
 		} else {
 			var thread = response;
 		}
 		if (state.nextThreadPage == undefined && 'message' in response) {
			var name = idToName(response.from.id, response.from.name);
			//todo: figure out how to get initial message datetime from Graph API
			state.firstMessage = 
			"<span class='datetime'>" + "____-__-__-__:__:__" + "</span>" +
			" - &lt;"+"<span class='name'>" + name+ "</span>"+"&gt;" + ": " + 
			"<span class='message'>" + response.message + "</span>" + "<br>";
 		} 

 		if (state.nameList == undefined  && 'to' in response) {
			state.nameList = generateNameList(response.to.data)
		}

 		if (state.nextThreadPage == undefined  && 'to' in response) {
			
		}
 		if ('data' in thread) {
 			for (var i = thread.data.length-1; i>=0; i--) {
 				if (thread.data[i].message != undefined) {
				var name = idToName(thread.data[i].from.id, thread.data[i].from.name);
 					tempChat = 
					"<span class='datetime'>" + formatDatetime(thread.data[i].created_time) + "</span>" +
					" - &lt;"+"<span class='name'>" + name+ "</span>"+"&gt;" + ": " + 
					"<span class='message'>" + thread.data[i].message + "</span>" + "<br>" + tempChat;
 				}
 			}
 			if ('paging' in thread && 'next' in thread.paging) {
				state.nextThreadPage = thread.paging.next;
 				document.getElementById("threadLoadButtons").style.visibility='visible';
 			}
			else
			{
				state.nextThreadPage = undefined;
				tempChat = state.firstMessage + tempChat;
 				document.getElementById("threadLoadButtons").style.visibility='hidden';
 				document.getElementById("saveThread").style.visibility='visible';
			}
 			document.getElementById("chat").innerHTML = tempChat + chat;
	    	document.getElementById("loading").style.visibility='hidden';
 		}
 };
 
 function processThreadRecurse(response) {
	 processThread(response);
	 if(state.nextThreadPage != undefined)
	 {
	    document.getElementById("loading").style.visibility='visible';
	    document.getElementById("threadLoadButtons").style.visibility='hidden';
	 	setTimeout("FB.api(state.nextThreadPage, processThreadRecurse)", 333);
	 }
 };
 
 
 function generateNameList(list) {
	var result="";
	var count = 0;
	//logic here -  display up to 3 names, then ellipses
	//todo - stop loop early after 4th name
	for (var i = 0; i < list.length; i++) {
			if(list[i].id!=state.id)
			{
				switch(count)
				{
				case 2:
				case 1:
					result = result + ", "; //and drop through
				case 0:
					result = result + idToName(list[i].id, list[i].name); 
					break;
				case 4:
					result = result + "... ";
					break;
				default: //do nothing
					break;
				}
				count++;
			}
	}
	return result;
 }
 
function processMailbox(response) {
  		console.log(response);
 			list=response;
  			for (var i = 0;  i < list.data.length; i++) {
 				thread=list.data[i];
				document.getElementById("chatlist").innerHTML = document.getElementById("chatlist").innerHTML +
					(document.getElementById("chatlist").innerHTML == "" ? "" : " | ") +
					"<span id=\'" + thread.id + "\'" + 
					('comments' in thread ? " onClick=\"FB.api('/"+thread.id+"', clearAndProcessThread())" : " class='unavailable'") + "\">" + 
					generateNameList(thread.to.data) + "</span>";
				
 			}

 			if ('paging' in list && 'next' in list.paging) {
				state.nextMailboxPage = list.paging.next;
				document.getElementById("loadMoreMailbox").style.visibility='visible'; 
 			}
			else
			{
				state.nextMailboxPage = undefined;
				document.getElementById("loadMoreMailbox").style.visibility='hidden';
			}
  			console.log(response);
	    	document.getElementById("loading").style.visibility='hidden';
  		};

 function testAPI() {
 	console.log('Welcome!  Fetching your information.... ');
 	FB.api('/me', function(response) {
 		console.log('Good to see you, ' + response.name + '.');
 		state.id = response.id;
		idToName(response.id, response.name);
		console.log(state.names);
		FB.api('/me/inbox', processMailbox);
 		
 	});
 }
 function loadMoreMailbox() {
	    document.getElementById("loadMoreMailbox").style.visibility='hidden';
	    document.getElementById("loading").style.visibility='visible';
 		FB.api(state.nextMailboxPage, processMailbox);
 }
 function loadMoreThread() {
	    document.getElementById("threadLoadButtons").style.visibility='hidden';
	    document.getElementById("loading").style.visibility='visible';
 		FB.api(state.nextThreadPage, processThread);
 }
 //todo
 function loadAllThread() {
	    document.getElementById("threadLoadButtons").style.visibility='hidden';
	    document.getElementById("loading").style.visibility='visible';
 		FB.api(state.nextThreadPage, processThreadRecurse);
 }
 function saveThread() {
	var div = document.getElementById("chat");
	var text =  div.innerText || div.textContent || "";
	if(text!="")
	{
		var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
		var filename = "chatlog-"  +state.nameList+ ".txt";
		saveAs(blob, filename);
	}
 }
 
 
 function initializePage(){
   state.idToName = {};
   state.names = {};
  
   //Facebook boilerplate code
   window.fbAsyncInit = function() {
  	FB.init({
  		appId: '219771764876605',
  		status: true, // check login status
  		cookie: true, // enable cookies to allow the server to access the session
  		xfbml: true // parse XFBML
  	});

  	// Here we subscribe to the auth.authResponseChange JavaScript event. This event is fired
  	// for any authentication related change, such as login, logout or session refresh. This means that
  	// whenever someone who was previously logged out tries to log in again, the correct case below 
  	// will be handled. 
  	FB.Event.subscribe('auth.authResponseChange', function(response) {
  		// Here we specify what we do with the response anytime this event occurs. 
  		if (response.status === 'connected') {
  			// The response object is returned with a status field that lets the app know the current
  			// login status of the person. In this case, we're handling the situation where they 
  			// have logged in to the app.

  			FB.api('/me/permissions', function(response) {
  				console.log(response);

  				if (response.data[0].read_mailbox == 1 && response.data[0].publish_actions == 1) {
  					testAPI();
  				} else {
  					FB.login(function(response) {}, {
  						scope: 'read_mailbox,publish_actions'
  					});
  				}
  			});

  		} else if (response.status === 'not_authorized') {
  			// In this case, the person is logged into Facebook, but not into the app, so we call
  			// FB.login() to prompt them to do so. 
  			// In real-life usage, you wouldn't want to immediately prompt someone to login 
  			// like this, for two reasons:
  			// (1) JavaScript created popup windows are blocked by most browsers unless they 
  			// result from direct interaction from people using the app (such as a mouse click)
  			// (2) it is a bad experience to be continually prompted to login upon page load.
  			FB.login();
  		} else {
  			// In this case, the person is not logged into Facebook, so we call the login() 
  			// function to prompt them to do so. Note that at this stage there is no indication
  			// of whether they are logged into the app. If they aren't then they'll see the Login
  			// dialog right after they log in to Facebook. 
  			// The same caveats as above apply to the FB.login() call here.
  			FB.login();
  		}
  	});
  };

  // Load the SDK asynchronously
  (function(d) {
  	var js, id = 'facebook-jssdk',
  		ref = d.getElementsByTagName('script')[0];
  	if (d.getElementById(id)) {
  		return;
  	}
  	js = d.createElement('script');
  	js.id = id;
  	js.async = true;
  	js.src = "//connect.facebook.net/en_US/all.js";
  	ref.parentNode.insertBefore(js, ref);
  }(document));
 }
 
