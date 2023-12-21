const express = require("express");
const path = require("path");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");

const app = express();

const SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.labels",
    "https://mail.google.com/",
];

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const labelName = "Auto Reply mails";

app.get("/api", async (req, res) => {
    const userEmail = req.query.email;

    if (!userEmail) {
        return res.status(400).send('Email parameter is missing.');
    }

    const auth = await authenticate({
        keyfilePath: path.join(__dirname, "credentials.json"),
        scopes: SCOPES,
    });
    const gmail = google.gmail({ version: "v1", auth });

    const response = await gmail.users.labels.list({
        userId: "me",
    });

    async function getUnrepliesMessages(auth) {
        const gmail = google.gmail({ version: "v1", auth });
        const response = await gmail.users.messages.list({
            userId: "me",
            labelIds: ["INBOX"],
            q: '-in:chats -from:me -has:userlabels',
        });
        return response.data.messages || [];
    }

    async function addLabel(auth, message, labelId) {
        const gmail = google.gmail({ version: 'v1', auth });
        await gmail.users.messages.modify({
            userId: 'me',
            id: message.id,
            requestBody: {
                addLabelIds: [labelId],
                removeLabelIds: ['INBOX'],
            },
        });

        console.log(`Label added to message: ${message.id}`);
    }

    async function createLabel(auth) {
        const gmail = google.gmail({ version: "v1", auth });
        try {
            const response = await gmail.users.labels.create({
                userId: "me",
                requestBody: {
                    name: labelName,
                    labelListVisibility: "labelShow",
                    messageListVisibility: "show",
                },
            });
            return response.data.id;
        } catch (error) {
            if (error.code === 409) {
                const response = await gmail.users.labels.list({
                    userId: "me",
                });
                const label = response.data.labels.find(
                    (label) => label.name === labelName
                );
                return label.id;
            } else {
                throw error;
            }
        }
    }

    async function sendReply(auth, message) {
        const gmail = google.gmail({ version: 'v1', auth });
        const res = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'metadata',
            metadataHeaders: ['Subject', 'From'],
        });
        const subject = res.data.payload.headers.find(
            (header) => header.name === 'Subject'
        ).value
        const from = res.data.payload.headers.find(
            (header) => header.name === 'From'
        ).value;
        const replyTo = from.match(/<(.*)>/)[1];
        const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;
        const replyBody = `On vacation... and enjoying :)`;
        const rawMessage = [
            `From: me`,
            `To: ${replyTo}`,
            `Subject: ${replySubject}`,
            `In-Reply-To: ${message.id}`,
            `References: ${message.id}`,
            '',
            replyBody,
        ].join('\n');
        const encodedMessage = Buffer.from(rawMessage).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
            },
        });
        console.log(`Auto-reply sent to: ${replyTo}`);
    }

    const labelId = await createLabel(auth);
    console.log(`Label created  ${labelId}`);
    setInterval(async () => {
        const messages = await getUnrepliesMessages(auth);
        console.log(`found ${messages.length} unreplied messages`);

        for (const message of messages) {
            await sendReply(auth, message);
            console.log(`Replied to message: ${message.id}`);

            await addLabel(auth, message, labelId);
            console.log(`Added label to message: ${message.id}`);
        }
    }, Math.floor(Math.random() * (120 - 45 + 1) + 45) * 1000); // random intervals

    console.log('Received a request to /api');
    console.log('Auto-reply process initiated.');
    console.log('Email account:', userEmail);

    res.status(200).send('OK');
});

app.listen(3000, () => {
    console.log(`Server running on port: 3000`);
});
