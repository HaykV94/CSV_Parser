import cluster from "cluster"
import csv from "csv-parser"
import os from "os"
import { createReadStream, createWriteStream } from "fs"
import { log } from "console"
import fs from "fs"


const directory_pathName = process.argv[2]


export default function fromCSVtoJSONParser(fileName) {
    return new Promise((resolve, reject) => {
        const results = [];
        const readableStream = createReadStream(directory_pathName+ "/" + fileName)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                const jsonFileName = "./converted/" + fileName.slice(0, -3).concat("json");
                fs.writeFile(jsonFileName, JSON.stringify(results), (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results.length);
                    }
                });
            })
            .on('error', (err) => {
                reject(err);
            });
    })
}