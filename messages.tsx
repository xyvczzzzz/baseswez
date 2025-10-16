import fs from 'fs';
import chalk from "chalk";

declare global {
    var messages: {
        owner: string;
        group: string;
        private: string;
        wait: string;
        done: string;
    };
}

global.messages = {
    owner: "[ ! ] no, this is for owners only",
    group: "[ /\\ ] this is for groups only", 
    private: "[ ^_^ ] this is specifically for private chat", 
    wait: "[ <> ] Await Mohon Menunggu", 
    done: "[ <> ] Succes..."
};

export const msg = global.messages;
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    require(file);
});

export default msg;