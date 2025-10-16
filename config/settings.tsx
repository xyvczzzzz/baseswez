import fs from 'fs';
import chalk from "chalk";
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

declare global {
    var urlch: string;
    var status: boolean;
    var onwer: string[];
    var pairing: string;
}
global.urlch = "";
global.status = true;
global.onwer = ["628813014727"];
global.pairing = "VANNEYAX";

export const config = {
    urlch: global.urlch,
    status: global.status,
    onwer: global.onwer,
    pairing: global.pairing
};

export const urlch = global.urlch;
export const status = global.status;
export const onwer = global.onwer;
export const pairing = global.pairing;

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    import(`${file}?update=${Date.now()}`);
});

export default config;