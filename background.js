console.log("ping from Next Page");
          
    var isPageActionIconVisible = {};             
      
    // Listen for the content script to send a message to the background(current) page.
    //get message from content_script
    chrome.extension.onRequest.addListener(function (request, sender, sendResponse)
    {    
        console.log('onRequest background',request,sender);            
        if('canUseHotKey' in request)
        {
            sendResponse({"canUseHotKey":isPageActionIconVisible[sender.tab.id]});
            return;
        }
        if('GotoNextPage' in request)
        {
            chrome.tabs.update(sender.tab.id, { url: getNextUrl(sender.tab) });                
            return;
        }
        if('hide' in request){
            if(request.hide){
                chrome.pageAction.hide(sender.tab.id);                     
                isPageActionIconVisible[sender.tab.id] = false;                    
                console.log("hide");
                sendResponse({});
            }
            else
            {   //url has number
                var url1 = getNextUrl(sender.tab)                
                if(url1 != sender.tab.url)
                {
                    var xhr  = new XMLHttpRequest();
                    xhr.open("HEAD", url1,true);
                    xhr.onreadystatechange=function() 
                    {
                        if (xhr.readyState==4) 
                        {
                            console.log(xhr.getAllResponseHeaders());
                            if (xhr.status==200)
                            {
                                console.log("URL Exists!");
                                chrome.pageAction.show(sender.tab.id);
                                isPageActionIconVisible[sender.tab.id] = true;                                
                                console.log("show"); 
                                sendResponse({});                                
                                return;
                            }                        
                            else if (xhr.status==404) 
                                console.log("URL doesn't exist!");
                            else 
                                console.log("Page Status is "+xhr.status);
                            isPageActionIconVisible[sender.tab.id] = false;
                            chrome.pageAction.hide(sender.tab.id);  
                            console.log("hide");
                            sendResponse({});
                        }                        
                    }    
                    xhr.send(null);                    
                }
                else
                {
                    chrome.pageAction.hide(sender.tab.id);  
                    isPageActionIconVisible[sender.tab.id] = false;
                    console.log("hide");
                    sendResponse({});
                }                
            }
        }
    }); 
    
    //Fired when a tab is closed.
    chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
        console.log('Tab closed',tabId);
        if(tabId in isPageActionIconVisible){
            //cleanup
            delete isPageActionIconVisible[tabId];
        }
    });
    
    //fired twice, loading and complete
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        //console.log('background onUpdated: tabId, tab,changeInfo:',tabId, tab, changeInfo);         
        if (tab.url.substring(0, "chrome".length) !== "chrome"  && changeInfo.status == 'complete') {
            chrome.tabs.sendMessage(tabId, {"OnComplete":1}, function(response) {
                //console.log(response.status);
            });            
            //chrome.tabs.executeScript(tabId,{code:"document.body.style.background='red'"});            
        }
    });
    
    // Called when the user clicks on the page action.
    chrome.pageAction.onClicked.addListener(function(tab) {
        chrome.tabs.update(tab.id, { url: getNextUrl(tab) });
        _gaq.push(['_trackEvent', 'button', 'clicked']);
    });

    /*
    // Called when the user clicks on the browser action.        
    chrome.browserAction.onClicked.addListener(function (tab) {
        chrome.tabs.update(tab.id, { url: getNextUrl(tab) });
        _gaq.push(['_trackEvent', 'button', 'clicked']);
    });        
    */
    
    getNextUrl = function (tab) 
    {
        console.log(tab);
        //to match url encode ie blankspace = %20 etc
        var regexUrlEncode = /(%[0-9][A-F]|%[A-F][0-9]|%[0-9][0-9]|%[A-F][A-F])?/g;
        var text = tab.url;
        // can be used to exclude regex pattern
        var url1 = text.replace(regexUrlEncode, function (matchStr, matched) { return matched ? decodeURIComponent(matchStr) : matchStr; });
        
          var array = url1.match(/\d+/g);//extract numbers from url
          console.log(JSON.stringify(array));
          if (array != null || array.length > 0) {
              var counterStr = array[array.length - 1];//get last number
              console.log(counterStr);
              var counterInt = parseInt(counterStr, 10);
              var newCounterInt = counterInt + 1;                  
              var counterReplace = "";
              if ((counterInt + "").length < (newCounterInt + "").length) {
                  counterReplace = counterStr.substr(0, counterStr.lastIndexOf(counterInt) - 1) + newCounterInt;
              } else {
                  counterReplace = counterStr.substr(0, counterStr.lastIndexOf(counterInt)) + newCounterInt;
              }
              var splitUrl = url1.split(counterStr);
              if (splitUrl.length == 2) {
                  url1 = splitUrl.join(counterReplace);
                  console.log(counterReplace + " = " + url1);
              } else if (splitUrl.length > 2) {
                  url1 = splitUrl[0];
                  for (var i = 1; i < splitUrl.length; i++) {
                      if (i < splitUrl.length - 1) {
                          url1 += (counterStr + splitUrl[i]);
                      } else {
                          url1 += (counterReplace + splitUrl[i]);
                      }                          
                  }
              }
              console.log(url1);                  
          }
          return url1;
      }         