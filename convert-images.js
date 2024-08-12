const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const heicConvert = require('heic-convert');

// Function to convert images in a folder to PNG and copy all files
async function convertFolderToPNG(inputFolder, outputFolder) {
    try {
        // Ensure the output folder exists
        await fs.ensureDir(outputFolder);

        // Get all files in the input folder
        const files = await fs.readdir(inputFolder);

        for (const file of files) {
            const inputFile = path.join(inputFolder, file);
            const outputFile = path.join(outputFolder, path.parse(file).name + '.png');

            // Determine the file extension
            const ext = path.extname(file).toLowerCase();

            if (ext === '.heic') {
                console.log(`Processing HEIC file: ${file}`);

                try {
                    const inputBuffer = await fs.readFile(inputFile);

                    // Convert HEIC to PNG using heic-convert
                    const outputBuffer = await heicConvert({
                        buffer: inputBuffer, // the HEIC file buffer
                        format: 'PNG',       // output format
                        quality: 1           // 0 (worst) to 1 (best)
                    });

                    // Save the converted PNG buffer to a file
                    await fs.writeFile(outputFile, outputBuffer);

                    console.log(`Converted ${file} to PNG.`);
                } catch (err) {
                    console.error(`Failed to process ${file}: ${err.message}`);
                }
            } else if (['.jpeg', '.jpg'].includes(ext)) {
                console.log(`Processing file: ${file}`);

                try {
                    // Convert to PNG format using sharp
                    await sharp(inputFile)
                        .png()
                        .toFile(outputFile);

                    console.log(`Converted ${file} to PNG.`);
                } catch (err) {
                    console.error(`Failed to process ${file}: ${err.message}`);
                }
            } else if (ext === '.png') {
                console.log(`Copying PNG file without conversion: ${file}`);
                await fs.copy(inputFile, path.join(outputFolder, file));
            } else if (['.mp4', '.mov'].includes(ext)) {
                console.log(`Copying video file: ${file}`);
                await fs.copy(inputFile, path.join(outputFolder, file));
            } else {
                console.log(`Copying non-image file: ${file}`);
                await fs.copy(inputFile, path.join(outputFolder, file));
            }
        }

        console.log('All files have been processed.');
    } catch (err) {
        console.error(`Error during processing: ${err.message}`);
    }
}

// Example usage
const inputFolder = path.join(__dirname, 'input'); // Replace with your input folder path
const outputFolder = path.join(__dirname, 'output'); // Replace with your output folder path

convertFolderToPNG(inputFolder, outputFolder);
