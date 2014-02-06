fbchatarchiver
==============

Tool to pull Facebook chat history into IRC-like text format using the Facebook OpenGraph API.

Running at http://talk.at443.net/fb/.


Todo:
-----
-better handle rate limiting
-stop autolaunching popups that get blocked by most browsers
-add setting to control showing unavailable and group chats

Known issues:
-------------
-some chat text is unaivalable from the Graph API. This seems to be due to users opting out of the Graph API
-API does not let us know if we have all data on first call, so first message isn't shown unless 'MORE' or 'ALL' is clicked even in this case
-API doesn't expose datetime of first message in conversation

