const { exec } = require('child_process');

// Hole den von Render bereitgestellten Port oder nutze einen Standardport
const PORT = process.env.PORT || 2150;

// Starte die Anwendung und setze den Port dynamisch
const command = `PORT=${PORT} pnpm start`;

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error starting application: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
    }
    console.log(stdout);
});
