const express = require('express');
const cors = require('cors')
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 1205;

app.use(cors());

// Route
app.get('/signals', (req, res) => {
    const filePath = path.resolve(__dirname, '../dummy.json');
    console.log(filePath);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: "Erreur lors de la lecture du fichier" });
            return;
        }
        res.json(JSON.parse(data));
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
