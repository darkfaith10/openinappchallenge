                                                                                      OpeninApp Challenge
                                                                                      
Description
This repository contains a Node.js application (app.js) and an HTML file (index.html) for the OpeninApp Challenge. The application allows users to log in with their Google account, and it automatically sends vacation auto-replies to unreplied emails. The HTML file provides a simple user interface for initiating the login process.

Installation and Setup
Follow these steps to set up the application:

Clone the repository:
bash
Copy code
git clone https://github.com/your-username/openinapp-challenge.git
cd openinapp-challenge


Install dependencies:
bash
Copy code
npm install


Obtain Google Cloud Platform (GCP) Credentials:
Go to the GCP Console.
Create a new project or select an existing one.
Enable the Gmail API for your project.
Create credentials for a service account and download the JSON file.
Save the downloaded JSON file as credentials.json in the project root.


Usage
Start the server:
bash
Copy code
node app.js


Open the application in a web browser:
Navigate to http://localhost:3000.
Click the "Login with Google" button.
Enter your Gmail address when prompted.
Auto-replies will be sent to unreplied emails labeled "Auto Reply mails" at random intervals.

Libraries Used
Express: Web framework for Node.js.
path: Module for handling file paths.
@google-cloud/local-auth: Library for authenticating with Google Cloud Platform locally.
googleapis: Official JavaScript client library for Google APIs.
Bootstrap: Front-end framework for styling the HTML page.

1. app.js Overview
Express Setup:

Initializes an Express application.
Serves static files from the 'public' directory.
Defines routes for the root path ('/') and the '/api' endpoint.


Google API Authentication:
Uses the @google-cloud/local-auth library to authenticate with Google APIs locally.


Label and Auto-Reply Logic:
Creates a label named "Auto Reply mails" on the user's Gmail account using the Gmail API.
Periodically checks for unreplied emails in the inbox and sends auto-replies.
Adds the "Auto Reply mails" label to emails that have received an auto-reply.


2. Functions in Detail


2.1 getUnrepliesMessages(auth)
Description:
Retrieves a list of unreplied messages from the user's inbox.


2.2 addLabel(auth, message, labelId)
Description:
Adds the "Auto Reply mails" label to a specific message and removes it from the inbox.


2.3 createLabel(auth)
Description:
Creates the "Auto Reply mails" label if it doesn't exist.
If the label already exists, retrieves its ID.


2.4 sendReply(auth, message)
Description:
Sends an auto-reply to the sender of a specific message.
Uses the Gmail API to send the reply with a predefined subject and body.


2.5 setInterval(...)
Description:
Initiates the auto-reply process at random intervals between 45 and 120 seconds.
Checks for unreplied messages, sends auto-replies, and adds labels.


3. Important Note
Security:
Emphasizes the importance of keeping the credentials.json file secure and not sharing it publicly.
These functions work together to automate the process of sending vacation auto-replies for unreplied emails in the user's Gmail inbox. The random intervals help avoid predictable patterns in the auto-reply behavior.

Happy Coding....  :)
