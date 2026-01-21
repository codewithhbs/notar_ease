const { google } = require("googleapis");


function buildDateObject(date, time) {
  const datePart = new Date(date).toISOString().split("T")[0]; // YYYY-MM-DD
  return new Date(`${datePart}T${time}:00+05:30`);
}

function buildISODateTime(date, time) {
  // date = Date object OR ISO string
  // time = "HH:mm"

  const datePart = new Date(date).toISOString().split("T")[0]; // YYYY-MM-DD
  return new Date(`${datePart}T${time}:00+05:30`).toISOString();
}

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

auth.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({ version: "v3", auth });

async function createGoogleMeet({ title, date, startTime, endTime }) {
  const startDateTime = buildISODateTime(date, startTime);
  const endDateTime = buildISODateTime(date, endTime);

  // ✅ SAFETY CHECK
  if (new Date(endDateTime) <= new Date(startDateTime)) {
    throw new Error("End time must be after start time");
  }

  const event = {
    summary: title,
    start: {
      dateTime: startDateTime,
      timeZone: "Asia/Kolkata",
    },
    end: {
      dateTime: endDateTime,
      timeZone: "Asia/Kolkata",
    },
    conferenceData: {
      createRequest: {
        requestId: Date.now().toString(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const res = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
    conferenceDataVersion: 1,
  });

  return res.data.hangoutLink;
}


module.exports = createGoogleMeet;
