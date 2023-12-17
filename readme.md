## Zoho Notebook to Joplin Notes Converter

Script to convert your Zoho notebooks saved to Joplin notes.
It parses the XML files, converts formatting to markdown, and creates new notes in a Joplin notebook.

Zoho Notebook stores the notebooks in:
- Linux: `~/.config/Notebook/Notecards/`

**Features:**

* Converts titles, body text, tags, and creation/modification timestamps.
* Supports checkboxes, ordered and unordered lists, and basic formatting.

**Requirements:**

* Node.js v16+
* Joplin API account and token
* Zoho Notebook installed and configured

**Installation:**

1. Install dependencies: `yarn install`
2. Copy the `.env.sample` in the project root to `.env` file. Fill the following environment variables:
    * `JOPLIN_BASE_URL`: URL of your Joplin server
    * `JOPLIN_TOKEN`: Your Joplin API token
    * `NOTEBOOK_ID`: ID of the Joplin notebook to import notes into (optional)
    * `ZOHO_NOTECARDS_FOLDER_PATH`: Directory containing your Zoho notes relative to the script.

You can get the Joplin base url and token from the Joplin desktop application, on the Web Clipper Options screen.

**Usage:**

1. Run the script: `yarn start`
2. The script will convert each note and create a new Joplin note.

**Notes:**

* If you have any custom formatting or tags in your Zoho notes, the script may not convert them exactly.
* This script is still under development, and some features may not be supported yet.

**TODO:**

* Preserves location information (if available).
* Prompts for clarification where needed.


**Contributing:**

We welcome contributions to improve this script. Please fork the repository and submit pull requests.

**License:**

MIT

Please let me know if you have any other questions.
