Demonstration of decentralized in-page social actions.

1.  Run the server, using `npm start`.  You can do this on a remote host or on localhost.  It'll output some 'Home Site' and 'Away Site' URLs for you.

2.  Visit one of the 'Home Site' URLs provided.  It should make your browser ask for permission to add the handler.  It will only ask this the first time for each Home Site URL.  (A different port counts as a different site.)

3.  Visit one of the Away sites provided, to see it embed access to your home site.

This is based on [web-based protocol handlers](https://developer.mozilla.org/en-US/docs/Web-based_protocol_handlers)

