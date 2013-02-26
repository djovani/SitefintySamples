// JavaScript Document
// Wait for PhoneGap to load
document.addEventListener("deviceready", onDeviceReady, false);

// PhoneGap is ready
function onDeviceReady() {
    navigator.splashscreen.hide();
}

//=======================Sitefinity Client Authentication====================//
var bootstrapToken;
var baseUrl;
var username;
var password;
var getSubsribersService = "Sitefinity/Services/Newsletters/Subscriber.svc/";
var SubscriberFormat =
"{\
    \"Context\":\
    [{\
        \"Key\":\"String content\",\"Value\":\"String content\"}],\
        \"IsGeneric\":true,\"Items\":\
            \[{\"Email\":\"String content\",\
            \"FirstName\":\"String content\",\
            \"Id\":\"1627aea5-8e0a-4371-9022-9b504344e724\",\
            \"LastName\":\"String content\",\
            \"Lists\":\
                \[{\"ApplicationName\":\"String content\",\
                    \"CampaignsCount\":2147483647,\
                    \"CampaignsText\":\"String content\",\
                    \"DefaultFromName\":\"String content\",\
                    \"DefaultReplyToEmail\":\"String content\",\
                    \"DefaultSubject\":\"String content\",\
                    \"DynamicLists\":\
                        \[{\"ConnectionName\":\"String content\",\
                        \"DynamicListProviderName\":\"String content\",\
                        \"EmailMappedField\":\"String content\",\
                        \"FirstNameMappedField\":\"String content\",\
                        \"LastNameMappedField\":\"String content\",\
                        \"ListKey\":\"String content\"}],\
                    \"GoodByeMessageEmailAddress\":\"String content\",\
                    \"GoodByeMessageSubject\:\"String content\",\
                    \"GoodByeTemplateId\":\"1627aea5-8e0a-4371-9022-9b504344e724\",\
                    \"Id\":\"1627aea5-8e0a-4371-9022-9b504344e724\",\
                    \"SendGoodByeMessage\":true,\
                    \"SendWelcomeMessage\":true,\
                    \"SubscribersCount\":\"String content\",\
                    \"SubscribersCountText\":\"String content\",\
                    \"SubscriptionReminder\":\"String content\",\
                    \"Title\":\"String content\",\
                    \"UnsubscribePageId\":\"1627aea5-8e0a-4371-9022-9b504344e724\",\
                    \"WelcomeMessageEmailAddress\":\"String content\",\
                    \"WelcomeMessageSubject\":\"String content\",\
                    \"WelcomeTemplateId\":\"1627aea5-8e0a-4371-9022-9b504344e724\"}],\
            \"Name\":\"String content\",\
            \"SubscriberReportUrl\":\"String content\"}],\
    \"TotalCount\":2147483647} ";
jQuery.support.cors = true;

function getBootstrapToken() {
    if (verifyInputs()) {
        var authUrl = baseUrl + "Sitefinity/Authenticate";
        $.ajax({
            url: authUrl,
            crossDomain: true,
            complete: function (jqXHR, textStatus) {
                var resCode = jqXHR.status;
                var resHeaders = jqXHR.getAllResponseHeaders();
                if (resCode == 200) {
                    // This means the STS (Security Token Service) is in the same site and we can submit the credentials directly.
                    // In this example we are going to use WRAP with Simple Web Token, therefore we need to add 
                    // /SWT to the service URL
                    localServiceAuth();

                } else if (resCode == 302) {
                    // This means the site is using external STS or Single Sign-on
                    // You have to obtain the token form the STS specified in the location parameter in the response headers
                    remoteServiceAuth(resHeaders);
                }
                else {
                    $("#signinMessage").text("Unexpected response from authentication service.");
                }
            }
        });
    }
}

function localServiceAuth() {
    var formData = "wrap_name=" + username + "&wrap_password=" + password;
    var authUrl = baseUrl + "Sitefinity/Authenticate/SWT";
    $.ajax({
        url: authUrl,
        crossDomain: true,
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        data: formData,
        complete: function (jqXHR, textStatus) {
            var resCode = jqXHR.status;
            if (resCode == 200) {
                // we expect WRAP formatted response which is the same as query string
                //var resBody = jqXHR.
                var resText = jqXHR.responseText;
                var query = $.parseQuery(resText);
                // parseQuery() also performs URL decode, but for some reason it wrongly decodes %2b to space instead of +
                // This causes wrong HMAC hash calculation on the server, that is why we are replacing space with + 
                bootstrapToken = query.wrap_access_token.replace(" ", "+");
                $("#signinMessage").text("Security token retrieved.");
            } else if (resCode == 401) {
                // This means wrong credentials were submitted
                $("#signinMessage").text("Wrong username or password. Please make sure the correct username and password are entered and try again.");
            }
            else {
                $("#signinMessage").text("Unexpected response from authentication service.");
            }
        }
    });
}

function remoteServiceAuth(resHeaders) {
    // TODO: retrieve the redirect location from the headers and get the token from there.
    // Pass the credentials as basic authentication to the remote STS
    $("#signinMessage").text("This Sitefinity instance is set to use Single Sing-On but SSO is not supported in this example.");
}

function signOut() {
    if (bootstrapToken) {
        
        var signOutUrl = baseUrl + "Sitefinity/SignOut" + "?" + bootstrapToken;
        $.ajax({
            url: signOutUrl,
            crossDomain: true,
            complete: function (jqXHR, textStatus) {
                if (jqXHR.status == 200) {
                    $("#signinMessage").text("Successfully signed out.");
                } else {
                    $("#signinMessage").text("Something went wrong.");
                }
            }
        });
    } else {
        $("#signinMessage").text("You are not signed in.");
    }
}

function setAuthorizationHeader(jqXHR) {
    jqXHR.setRequestHeader('Authorization', "WRAP access_token=\"" + bootstrapToken + "\"");
}

function verifyInputs() {
    $("#signinMessage").html("Retrieving security token...");
    baseUrl = $("#baseUrl").val();
    username = $("#username").val();
    password = $("#password").val();

    var errorMessage = "Please enter: ";
    if (baseUrl == "") {
        errorMessage += "Base URL";
    }
    if (username == "") {
        if (errorMessage != "Please enter: ")
            errorMessage += ", ";
        errorMessage += "Username"
    }
    if (password == "") {
        if (errorMessage != "Please enter: ")
            errorMessage += ", ";
        errorMessage += "Password"
    }
    if (errorMessage != "Please enter: ") {
        errorMessage += ".";
        $("#signinMessage").text(errorMessage);
        return false;
    } else {
        if (baseUrl[baseUrl.length - 1] != "/") {
            baseUrl += "/";
        }
        return true;   
    }
}

function GetSubScribers() {
    if (bootstrapToken) {
        var serviceUrl = baseUrl + getSubsribersService;
          $.ajax({
            url: serviceUrl,
            crossDomain: true,
            beforeSend: setAuthorizationHeader,
            type: "GET",
            contentType: "application/json",
            success: function(data){
               $('#subscriberslist li').remove();
               $.each(data.Items, function(index, item) {
                   $("#subCount").html(data.Items.length.toString() + " subscriber(s).");
                   $('#subscriberslist').append('<li>' + item.FirstName + ' ' + item.LastName  + '</li>');	
               });
            },
            error: errorFunc
        });
    }
}

function errorFunc (jqXHR, textStatus, errorThrown){
    alert('Subscribers error: ' + textStatus);
}

String.format = function () {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }
    return s;
}