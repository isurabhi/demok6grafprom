import http from "k6/http";
import { check, sleep } from "k6";

export function getMfaCode(domain, inbox, mailUrl, apiToken) {
  // reading the mailbox and picking the first email.
  const resInbox = http.get(
    `${mailUrl}${domain}/inboxes/${inbox}/?limit=1&sort=descending&token=${apiToken}`
  );
  //console.log(inboxUrl);
  //console.log(resInbox.json("msgs"));
  const messageId = resInbox.json("msgs.0.id");
  console.log(messageId);
  //----------------------------------------------------------------------

  // reading the message and scan body for CODE
  const resMessage = http.get(
    `${mailUrl}${domain}/inboxes/${inbox}/messages/${messageId}/?token=${apiToken}`
  );
  const mail = resMessage.json("parts.0.body");
  // search message text
  const codeRegex =
    /Security code: <span class=\"security-code-span\" style=\"font-weight: 700; font-size: 105%;\">(\d+)/;
  const match = codeRegex.exec(mail);
  if (match) {
    return match[1];
  } else {
    throw new Error("Could not find 2FA code in email message");
  }
  //------------------------------------------------------------------------
}
