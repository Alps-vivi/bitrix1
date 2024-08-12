# Implementing Bitrix24 OAuth system

Main functions:
• Receive Install App event.
• Save access token and refresh token (json).
• Renew token when expired.
• Call crm.contact.list API with existing token.

# How to run

note: install nodejs(&axios),ngrok first before running 

1. Download ZIP file & open in VScode
2. Open terminal run "node server.js"
3. Open a new terminal "ngrok http 5500"
   You will received a Forwarding link (example:https://6eba-14-232-141-238.ngrok-free.app)
4. Use that link to change your handler path in your bitrix24 local app
   How to change:
   - Login on bitrix24
   - Applications > Developer Resources > Intergations
   - Edit your local app's handler path with "/callback" (example: https://a785-14-232-141-238.ngrok-free.app/callback)
   - Save and Reinstall
5. Access http://localhost:5500/Install to saved tokens
6. Access http://localhost:5500/Test to see the test API
