import "./config/settings.js";

import pino from "pino";
import path from 'path';
import { Boom } from "@hapi/boom";
import axios from "axios";
import fs from "fs";
import PhoneNumber from "awesome-phonenumber";
import FileType from "file-type";
import chalk from 'chalk';
import readline from "readline";
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import * as Baileys from "@vynnox/lyvineemine";

import { smsg } from "./lib/myfunc.js";
import { 
    imageToWebp,
    videoToWebp,
    writeExifImg,
    writeExifVid,
    writeExif
} from "./lib/watermark.js";
import { NevariaConnect } from './lib/connect.js';
import caseHandler from "./case.js";
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { 
    makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeInMemoryStore, 
    jidDecode, 
    makeCacheableSignalKeyStore, 
    Browsers,
    downloadContentFromMessage
} = Baileys;

const getBuffer = async (url: string, options?: any): Promise<Buffer> => {
    try {
        options = options || {};
        const res = await axios({
            method: "get",
            url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1,
            },
            ...options,
            responseType: 'arraybuffer'
        });
        return Buffer.from(res.data);
    } catch (err) {
        throw err;
    }
};

const getSizeMedia = (path: string | Buffer): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (typeof path === 'string' && /http/.test(path)) {
            axios.head(path)
                .then((res) => {
                    const length = parseInt(res.headers['content-length'] || '0');
                    const size = formatSize(length);
                    if (!isNaN(length)) resolve(size);
                    else reject("Invalid content length");
                })
                .catch(reject);
        } else if (Buffer.isBuffer(path)) {
            const length = Buffer.byteLength(path);
            const size = formatSize(length);
            if (!isNaN(length)) resolve(size);
        } else {
            reject("error path tidak valid");
        }
    });
};

const formatSize = (bytes: number, si: boolean = true, dp: number = 2): string => {
    const thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;
    do {
        bytes /= thresh;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
    return bytes.toFixed(dp) + ' ' + units[u];
};

interface ExtendedWASocket extends ReturnType<typeof makeWASocket> {
    public?: boolean;
    decodeJid?: (jid: string) => string;
    sendText?: (jid: string, text: string, quoted?: any, options?: any) => Promise<void>;
    downloadMediaMessage?: (message: any) => Promise<Buffer>;
    getFile?: (PATH: string | Buffer, save?: boolean) => Promise<any>;
    sendMedia?: (jid: string, path: string, fileName?: string, caption?: string, quoted?: any, options?: any) => Promise<void>;
    serializeM?: (m: any) => any;
}

(async (): Promise<void> => {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(chalk.magenta(`-- Using WA v${version.join('.')}, isLatest: ${isLatest} --`));

    const pairingCode = true;

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (text: string): Promise<string> => new Promise((resolve) => rl.question(text, resolve));

    async function clientstart(): Promise<ExtendedWASocket> {
        const {
            state,
            saveCreds
        } = await useMultiFileAuthState("session");
        const usePairingCode = true;

        const vynnoxbeyours = makeWASocket({
            printQRInTerminal: !usePairingCode,
            syncFullHistory: true,
            markOnlineOnConnect: true,
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 0,
            keepAliveIntervalMs: 10000,
            generateHighQualityLinkPreview: true,
            patchMessageBeforeSending: (message: any) => {
                const requiresPatch = !!(
                    message.buttonsMessage
                    || message.templateMessage
                    || message.listMessage
                );
                if (requiresPatch) {
                    message = {
                        viewOnceMessage: {
                            message: {
                                messageContextInfo: {
                                    deviceListMetadataVersion: 2,
                                    deviceListMetadata: {}
                                },
                                ...message
                            }
                        }
                    };
                }
                return message;
            },
            version,
            browser: Browsers.ubuntu('Chrome'),
            logger: pino({
                level: 'fatal'
            }),
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino().child({
                    level: 'silent',
                    stream: 'store'
                })),
            }
        }) as ExtendedWASocket;

        if (usePairingCode && !vynnoxbeyours.authState?.creds.registered) {
            const phoneNumber = await question('Enter Your Number 62xxx: ');
            const code = await vynnoxbeyours.requestPairingCode(phoneNumber);
            console.log(`your pairing code: ${code}`);
        }

        const store = makeInMemoryStore({
            logger: pino().child({
                level: 'silent',
                stream: 'store'
            })
        });
        
        store.bind(vynnoxbeyours.ev);

        vynnoxbeyours.ev.on('messages.upsert', async (chatUpdate: any) => {
            try {
                let ciaa = chatUpdate.messages[0];
                if (!ciaa.message) return;
                ciaa.message = (Object.keys(ciaa.message)[0] === 'ephemeralMessage') ? ciaa.message.ephemeralMessage.message : ciaa.message;
                if (ciaa.key && ciaa.key.remoteJid === 'status@broadcast') return;
                if (!vynnoxbeyours.public && !ciaa.key.fromMe && chatUpdate.type === 'notify') return;
                let m = smsg(vynnoxbeyours, ciaa, store);
                caseHandler(vynnoxbeyours, m, chatUpdate, ciaa, store);
            } catch (err) {
                console.log(err);
            }
        });

        vynnoxbeyours.public = global.status;
        
        vynnoxbeyours.ev.on('connection.update', (update: any) => {
            NevariaConnect({ vynnoxbeyours, update, clientstart, DisconnectReason, Boom });
        });

        vynnoxbeyours.decodeJid = (jid: string): string => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                let decode = jidDecode(jid) || {};
                return decode.user && decode.server && decode.user + '@' + decode.server || jid;
            } else return jid;
        };

        vynnoxbeyours.ev.on('contacts.update', (update: any) => {
            for (let contact of update) {
                let id = vynnoxbeyours.decodeJid!(contact.id);
                if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
            }
        });

        vynnoxbeyours.sendText = async (jid: string, text: string, quoted: any = '', options?: any): Promise<void> => {
            await vynnoxbeyours.sendMessage(jid, {
                text: text,
                ...options
            }, { quoted });
        };
            
        vynnoxbeyours.downloadMediaMessage = async (message: any): Promise<Buffer> => {
            let mime = (message.msg || message).mimetype || "";
            let messageType = message.mtype ? message.mtype.replace(/Message/gi, "") : mime.split("/")[0];
            const stream = await downloadContentFromMessage(message, messageType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            return buffer;
        };

        vynnoxbeyours.getFile = async (PATH: string | Buffer, save?: boolean): Promise<any> => {
            let res;
            let filename: string;
            let data: Buffer;
            
            if (Buffer.isBuffer(PATH)) {
                data = PATH;
            } else if (/^data:.*?\/.*?;base64,/i.test(PATH)) {
                data = Buffer.from(PATH.split`,` [1], "base64");
            } else if (/^https?:\/\//.test(PATH)) {
                res = await getBuffer(PATH);
                data = res;
            } else if (fs.existsSync(PATH)) {
                filename = PATH;
                data = fs.readFileSync(PATH);
            } else if (typeof PATH === "string") {
                data = Buffer.from(PATH);
            } else {
                data = Buffer.alloc(0);
            }
            
            let type = await FileType.fromBuffer(data) || {
                mime: "application/octet-stream",
                ext: ".bin",
            };
            
            filename = path.join(__dirname, "./src/" + new Date().getTime() + "." + type.ext);
            if (data && save) await fs.promises.writeFile(filename, data);
            
            return {
                res,
                filename,
                size: await getSizeMedia(data),
                ...type,
                data,
            };
        };

        vynnoxbeyours.sendMedia = async (
            jid: string, 
            path: string, 
            fileName: string = "", 
            caption: string = "", 
            quoted: any = "", 
            options: any = {}
        ): Promise<void> => {
            let types = await vynnoxbeyours.getFile!(path, true);
            let { mime, ext, res, data, filename } = types;
            
            if ((res && res.status !== 200) || data.length <= 65536) {
                try {
                    throw {
                        json: JSON.parse(data.toString())
                    };
                } catch (e: any) {
                    if (e.json) throw e.json;
                }
            }
            
            let type = "";
            let mimetype = mime;
            let pathFile = filename;
            
            if (options.asDocument) type = "document";
            if (options.asSticker || /webp/.test(mime)) {
                let media = {
                    mimetype: mime,
                    data,
                };
                pathFile = await writeExif(media, {
                    packname: options.packname ? options.packname : global.packname,
                    author: options.author ? options.author : global.author,
                    categories: options.categories ? options.categories : [],
                });
                await fs.promises.unlink(filename);
                type = "sticker";
                mimetype = "image/webp";
            } else if (/image/.test(mime)) type = "image";
            else if (/video/.test(mime)) type = "video";
            else if (/audio/.test(mime)) type = "audio";
            else type = "document";
            
            await vynnoxbeyours.sendMessage(jid, {
                [type]: {
                    url: pathFile,
                },
                caption,
                mimetype,
                fileName,
                ...options,
            } as AnyMessageContent, {
                quoted,
                ...options,
            });
            
            return fs.promises.unlink(pathFile);
        };

        vynnoxbeyours.ev.on('creds.update', saveCreds);
        vynnoxbeyours.serializeM = (m: any) => smsg(vynnoxbeyours, m, store);
        
        return vynnoxbeyours;
    }

    await clientstart();

    let file = require.resolve(__filename);
    fs.watchFile(file, () => {
        fs.unwatchFile(file);
        console.log(chalk.redBright(`Update ${__filename}`));
        delete require.cache[file];
        import(`${file}?update=${Date.now()}`);
    });
})();
