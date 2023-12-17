const path = require('path');
const fsPromises = require('fs').promises;


const xml2js = require('xml2js');
const cheerio = require('cheerio');
const { config: joplinConfig, noteApi: joplinNotes } = require('joplin-api');
const dotenv = require('dotenv');

dotenv.config(); //load env


//configute the joplin
joplinConfig.baseUrl = process.env.JOPLIN_BASE_URL;
joplinConfig.token = process.env.JOPLIN_TOKEN;



function convertToMarkdown(text) {
    // Load HTML text and create Cheerio object
    const $ = cheerio.load(text, { xmlMode: true });

    // Convert checkboxes
    $('checkbox').each((i, el) => {
        const isChecked = $(el).attr('checked') === 'true';
        $(el).replaceWith(`- [${isChecked ? 'x' : ' '}] ${$(el).text().trim()} \n`);
    });

    // Convert ordered lists
    $('ol').each((i, el) => {
        const nested = $(el).children('li');
        const items = nested.map((i, li) => `1. ${$(li).text().trim()}`).toArray();
        $(el).replaceWith(items.join('\n'));
    });

    // Convert unordered lists
    $('ul').each((i, el) => {
        const nested = $(el).children('li');
        const items = nested.map((i, li) => `- ${$(li).text().trim()}`).toArray();
        $(el).replaceWith(items.join('\n'));
    });

    //preserve breaks
    $('br').each((i, el) => {
        $(el).replaceWith('\n');
    })

    // Convert remaining HTML to plain text and clean formatting
    const markdownText = $.text().trim();

    return markdownText;
}

async function parse(xmlString) {

    const result = await xml2js.parseStringPromise(xmlString, { trim: true, explicitArray: false })


    return {
        title: result.ZNote.ZMeta?.ZTitle?.trim(),
        created: new Date(result.ZNote.ZMeta?.ZCreatedDate).getTime(),
        modified: new Date(result.ZNote.ZMeta?.ZModifiedDate).getTime(),
        location: {
            long: result.ZNote.ZMeta?.ZLocation?.ZLongitude,
            lat: result.ZNote.ZMeta?.ZLocation?.ZLatitude,
        },
        color: result.ZNote.ZMeta?.ZNoteColor,
        body: convertToMarkdown(result.ZNote.ZContent?.trim()) //conver to markdown
    }
}

async function processFile(filePath) {

    const data = await fsPromises.readFile(filePath, 'utf8');

    if (data.includes('<ZNote>')) {
        const { title, body, created, modified } = await parse(data);

        await joplinNotes.create({
            title,
            body,
            notebookId: process.env.NOTEBOOK_ID,
            created_time: created,
            modified: modified,
            user_created_time: created,
            user_updated_time: modified,
            source: 'zoho-notebook-migration'
        })

        return { title, filePath }

    } else {
        console.log(`Skipping file ${filePath}: no ZNote tag found.`);
    }
}

/**
 * 
 * @param {String} directoryPath Absolute path to the folder with the zoho notes
 * @returns 
 */
async function convert(directoryPath) {
    try {
        const items = await fsPromises.readdir(directoryPath);

        for (const item of items) {
            const filePath = path.join(directoryPath, item);

            try {
                const stats = await fsPromises.stat(filePath);
                if (stats.isDirectory()) {
                    readFilesRecursively(filePath);
                } else {
                    processFile(filePath);
                }
            } catch (statErr) {
                if (statErr) {
                    console.error(`Error reading file stats for ${filePath}:`, statErr);
                    return;
                }
            }
        }
    } catch (err) {
        console.error(`Error reading directory ${directoryPath}:`, err);
        return;
    }


}


//location of your notes.
convert(path.join(__dirname, process.env.ZOHO_NOTECARDS_FOLDER_PATH));
