require('dotenv').config();
const { google } = require('googleapis');
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive.readonly']
});
const drive = google.drive({ version: 'v3', auth });

async function run() {
  try {
    const res = await drive.files.list({
      q: `'1p_flEdMei_KedZuDbaj8ju1pbKGf-COy' in parents and trashed = false`,
      fields: 'files(id, name, mimeType)',
      pageSize: 100
    });
    console.log("Files in root folder:");
    res.data.files.forEach(f => console.log(`- ${f.name} (${f.mimeType})`));
  } catch (e) {
    console.error(e);
  }
}
run();
