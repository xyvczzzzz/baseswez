import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface StickerPackKey {
    fromMe: boolean;
    participant: string;
    remoteJid: string;
}

export interface StickerPackMessage {
    stickerPackId: string;
    name: string;
    publisher: string;
}

export interface StickerPackMessageContent {
    stickerPackMessage: StickerPackMessage;
}

export interface QuotedMessage {
    key: StickerPackKey;
    message: StickerPackMessageContent;
}

export interface FQuoted {
    packSticker: QuotedMessage;
}
const fquoted: FQuoted = {
    packSticker: {
        key: {
            fromMe: false,
            participant: "15517868411@s.whatsapp.net",
            remoteJid: "15517868411@s.whatsapp.net"
        },
        message: {
            stickerPackMessage: {
                stickerPackId: "\u0000",
                name: "l lízanámi ˗ˋˏ63ˎˊ˗⁩",
                publisher: "< リザナミ幹部? "
            }
        }
    }
};

export default fquoted;

const currentFile: string = __filename;
fs.watchFile(currentFile, () => {
    fs.unwatchFile(currentFile);
    console.log(`\x1b[0;32m${currentFile} \x1b[1;32mupdated!\x1b[0m`);
    delete require.cache[currentFile];
    import(`${currentFile}?update=${Date.now()}`);
});
