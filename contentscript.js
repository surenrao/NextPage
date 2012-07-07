//to match url encode 
var regexUrlEncode = /(%[0-9][A-F]|%[A-F][0-9]|%[0-9][0-9]|%[A-F][A-F])?/g;
var text = document.location.href;// "http%3A%2F%2Fstackoverflow.com%2Fquestions%2F8317662%2Fasihttprequest-request-sent-twice";
// can be used to exclude regex pattern
var newtext = text.replace(regexUrlEncode, function (matchStr, matched) { return matched ? decodeURIComponent(matchStr) : matchStr; });
console.log(newtext);

var regex = /\d+/g;

if (regex.test(newtext)) {  
    chrome.extension.sendRequest({"hide":false}, function(response) {});
}
else{
    chrome.extension.sendRequest({"hide":true}, function(response) {});
}

try{
    $(document).ready(function () {                        
        $(document).keydown(function(e){              
            if (e.shiftKey && e.keyCode == 39) {    
                //alert( "right pressed ");                                                                      
                chrome.extension.sendRequest({"canUseHotKey":1}, function(response) {
                    if(response.canUseHotKey)
                    {     
                       chrome.extension.sendRequest({"GotoNextPage":1}, function(response) {});                                           
                    }
                });
                //return false;        
            }
        });                            
    }); 
}
catch(e)
{   
    console.log(e);
}
//chrome.extension.onRequest.addListener
chrome.extension.onMessage.addListener(function (request, sender, sendResponse){
    //console.log('onRequest contentscript',request);
    //this makes sure the dom is complete
    if('OnComplete' in request)
    {        
        /*
        $('*:contains("Next")').each(function () {
            if ($(this).children().length < 1)
                $(this).html("Suren");
        });
        */
        sendResponse({status:"done!"});
        //document.body.style.background ='red';
        return;
    }
});

//$(function () {
//    $('#nav').css("border", "solid 2px red");
//    var foundin = $('*:contains("Advertising Programs")')
//    foundin.each(function () {
//        
//        $(this).css("border", "solid 2px red");
//    });
//});