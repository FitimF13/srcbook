const { exec } = require('child_process');
const PORT = process.env.PORT || 2150;

// Starte den Service mit dem richtigen Port
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
