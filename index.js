import cluster from "cluster"
import os from "os"
import { log } from "console"
import fs from "fs"
import fromCSVtoJSONParser from "./src/csvParserHelper.js"



const directoryName = process.argv[2]


if (!directoryName) {
    process.on("exit", () => {
        console.log("Please enter an existing directory name containing CSV files");
    })
}


const workerProcessesCSVParser = (directoryName) => {
    return new Promise((resolve, reject) => {

        const availableCPUsCount = os.availableParallelism()


        const files = fs.readdirSync(directoryName)

        if (cluster.isPrimary) {
            const filesPerWorker = Math.ceil(files.length / availableCPUsCount);

            const data = [];

            for (let i = 0; i < files.length; i += filesPerWorker) {
                data.push(files.slice(i, i + filesPerWorker));
            }

            let startTime = Date.now();
            let worker

            for (const chunk of data) {
                worker = cluster.fork({ files: data });

            }
            // Listen for messages from worker processes
            worker.on('message', (message) => {
                if (typeof message.count === "number") {
                    console.log("All the CSV files are converted successfully");
                    const totalCount = message.count
                        const duration = Date.now() - startTime;
                        resolve({ totalCount, duration });
                        console.log(`The amount of processed records is ${totalCount}`);
                        console.log(`The duration of the whole process is ${duration + "ms"}`);
                    cluster.disconnect()
                }
            });
        } else {

            // worker processes

            let totalCountFromWorker = 0;
            let processCount = 0

            for (const file of files) {
                fromCSVtoJSONParser(file)
                    .then((count) => {
                        totalCountFromWorker += count;
                        processCount++
                        if (processCount === files.length) {
                            process.send({ count: totalCountFromWorker });
                        } else {
                            process.send({ count: "Not all CSV files are converted" })
                        }
                    })
                    .catch((error) => {
                        console.error(`Error processing ${file}:`, error);
                    });
            }
        }

    })
}

workerProcessesCSVParser(directoryName)