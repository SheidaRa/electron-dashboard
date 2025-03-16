const express = require('express');
const cors = require('cors')
const fs = require('fs');
const path = require('path');
const { spawn } = require("child_process");

const app = express();
const PORT = 1205;
app.use(cors());



const WORKING_DIRECTORY = path.resolve(__dirname, "../../../../../brnbci");
const GRAPH_FILE_PATH = path.join(__dirname, "../graphData.txt"); 


app.get('/graph', (req, res) => {
    console.log(`Spawning child process in directory: ${WORKING_DIRECTORY}`);

   
    const process = spawn("uv", ["run", "ezmsg", "--address", "127.0.0.1:25978", "mermaid"], { cwd: WORKING_DIRECTORY });

    let output = "";

    // Capture output
    process.stdout.on("data", (data) => {
        output += data.toString();
    });

    process.stderr.on("data", (data) => {
        console.error(`Error: ${data.toString()}`);
    });

    process.on("close", (code) => {
        if (code !== 0) {
            return res.status(500).send(`Command failed with exit code ${code}`);
        }

        // Save to file
        fs.writeFile(GRAPH_FILE_PATH, output, (err) => {
            if (err) {
                console.error("Error saving graph data:", err);
                return res.status(500).send("Error saving graph data.");
            }
            console.log("Graph data saved to graphData.txt");

            // Read and return it
            fs.readFile(GRAPH_FILE_PATH, 'utf8', (err, data) => {
                if (err) {
                    console.error("Error reading graphData.txt:", err);
                    return res.status(500).send("Error reading graph data.");
                }
                res.send(data);
            });
        });
    });
});



// dummy signals route
app.get('/signals', (req, res) => {
    const filePath = path.resolve(__dirname, '../dummyFiles/signals.json');
    console.log(filePath);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: "Error" });
            return;
        }
        res.json(JSON.parse(data));
    });
});

// dummy pipelines
app.get('/pipelines', (req, res) => {
    const filePath = path.resolve(__dirname, '../dummyFiles/pipelines.json');
    console.log(filePath);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: "Error" });
            return;
        }
        res.json(JSON.parse(data));
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
