/**
 * Create By Dika Ardnt.
 * Contact Me on wa.me/6288292024190
 * Follow https://github.com/DikaArdnt
 */

import {
    extractMessageContent,
    jidNormalizedUser,
    proto,
    delay,
    getContentType,
    areJidsSameUser,
    generateWAMessage,
    WAMessage,
    WASocket,
    AnyMessageContent,
    DownloadableMessage
} from "@vynnox/lyvineemine";
import chalk from 'chalk';
import fs from 'fs';
import Crypto from 'crypto';
import axios, { AxiosRequestConfig } from 'axios';
import moment from 'moment-timezone';
import { sizeFormatter } from 'human-readable';
import util from 'util';
import { defaultMaxListeners } from 'stream';
import { read, MIME_JPEG, RESIZE_BILINEAR, AUTO, Jimp } from 'jimp';

// Type definitions
interface Store {
    loadMessage(chatId: string, messageId: string, client: any): Promise<any>;
}

interface SizeFormatterOptions {
    std?: 'SI' | 'IEC' | 'JEDEC';
    decimalPlaces?: number;
    keepTrailingZeroes?: boolean;
    render?: (literal: string, symbol: string) => string;
}

interface ProfilePictureResult {
    img: Buffer;
    preview: Buffer;
}

interface QuotedMessage {
    key: {
        remoteJid: string;
        participant?: string;
        fromMe: boolean;
        id: string;
    };
    mtype: string;
    from: string;
    id: string;
    chat: string;
    isBaileys: boolean;
    sender: string;
    fromMe: boolean;
    text: string;
    mentionedJid: string[];
    fakeObj?: any;
    delete?: () => Promise<any>;
    copyNForward?: (jid: string, forceForward?: boolean, options?: any) => Promise<any>;
    download?: () => Promise<Buffer>;
}

interface ExtendedMessage extends WAMessage {
    id?: string;
    from?: string;
    isBaileys?: boolean;
    chat?: string;
    fromMe?: boolean;
    isGroup?: boolean;
    sender?: string;
    participant?: string;
    mtype?: string;
    msg?: any;
    body?: string;
    quoted?: QuotedMessage | null;
    mentionedJid?: string[];
    text?: string;
    download?: () => Promise<Buffer>;
    reply?: (text: string | Buffer, chatId?: string, options?: any) => Promise<any>;
    copy?: () => any;
    copyNForward?: (jid?: string, forceForward?: boolean, options?: any) => Promise<any>;
    getQuotedObj?: () => Promise<ExtendedMessage | false>;
    getQuotedMessage?: () => Promise<ExtendedMessage | false>;
}

const unixTimestampSeconds = (date: Date = new Date()): number => {
    return Math.floor(date.getTime() / 1000);
};

export { unixTimestampSeconds };

export const resize = async (image: Buffer | string, width: number, height: number): Promise<Buffer> => {
    const oyy = await Jimp.read(image as any);
    const kiyomasa = await oyy.resize(width, height).getBufferAsync(Jimp.MIME_JPEG);
    return kiyomasa;
};

export const generateMessageTag = (epoch?: string): string => {
    let tag = unixTimestampSeconds().toString();
    if (epoch) {
        tag += '.--' + epoch;
    }
    return tag;
};

export const processTime = (timestamp: number, now: number): number => {
    return moment.duration(now - moment(timestamp * 1000)).asSeconds();
};

export const getRandom = (ext: string): string => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
};

export const getBuffer = async (url: string, options?: AxiosRequestConfig): Promise<Buffer> => {
    try {
        const config = options || {};
        const res = await axios({
            method: "get",
            url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            },
            ...config,
            responseType: 'arraybuffer'
        });
        return Buffer.from(res.data);
    } catch (err) {
        throw err;
    }
};

export const formatSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
};

export const fetchJson = async (url: string, options?: AxiosRequestConfig): Promise<any> => {
    try {
        const config = options || {};
        const res = await axios({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
            ...config
        });
        return res.data;
    } catch (err) {
        throw err;
    }
};

export const runtime = function(seconds: number): string {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    const dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    const hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    const mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    const sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
};

export const clockString = (ms: number): string => {
    const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
    const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
    const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
};

export const reSize = async (buffer: Buffer, x: number, z: number): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        try {
            const buff = await read(buffer);
            const ab = await buff.resize(x, z).getBufferAsync(MIME_JPEG);
            resolve(ab);
        } catch (error) {
            reject(error);
        }
    });
};

export const sleep = async (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const isUrl = (url: string): boolean => {
    return !!url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'));
};

export const getTime = (format: string, date?: Date): string => {
    if (date) {
        return moment(date).locale('id').format(format);
    } else {
        return moment.tz('Asia/Jakarta').locale('id').format(format);
    }
};

export const formatDate = (n: number, locale: string = 'id'): string => {
    const d = new Date(n);
    return d.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    });
};

export const tanggal = (numer: number): string => {
    const myMonths = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const myDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jum\'at', 'Sabtu'];
    const tgl = new Date(numer);
    const day = tgl.getDate();
    const bulan = tgl.getMonth();
    let thisDay = tgl.getDay();
    thisDay = myDays[thisDay];
    const yy = tgl.getYear();
    const year = (yy < 1000) ? yy + 1900 : yy;
    const time = moment.tz('Asia/Jakarta').format('DD/MM HH:mm:ss');
    const d = new Date();
    const locale = 'id';
    const gmt = new Date(0).getTime() - new Date('1 January 1970').getTime();
    const weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(((d.getTime()) + gmt) / 84600000) % 5];

    return `${thisDay}, ${day} - ${myMonths[bulan]} - ${year}`;
};

export const formatp = sizeFormatter({
    std: 'JEDEC',
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal: string, symbol: string) => `${literal} ${symbol}B`,
} as SizeFormatterOptions);

export const jsonformat = (string: any): string => {
    return JSON.stringify(string, null, 2);
};

function format(...args: any[]): string {
    return util.format(...args);
}

export const logic = (check: any, inp: any[], out: any[]): any => {
    if (inp.length !== out.length) throw new Error('Input and Output must have same length');
    for (let i in inp) {
        if (util.isDeepStrictEqual(check, inp[i])) return out[i];
    }
    return null;
};

export const generateProfilePicture = async (buffer: Buffer): Promise<ProfilePictureResult> => {
    const jimpImage = await Jimp.read(buffer);
    const min = jimpImage.getWidth();
    const max = jimpImage.getHeight();
    const cropped = jimpImage.crop(0, 0, min, max);
    return {
        img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
        preview: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG)
    };
};

export const bytesToSize = (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const getSizeMedia = (path: string | Buffer): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (typeof path === 'string' && /http/.test(path)) {
            axios.get(path)
                .then((res) => {
                    const length = parseInt(res.headers['content-length'] || '0');
                    const size = bytesToSize(length, 3);
                    if (!isNaN(length)) resolve(size);
                    else reject('Invalid content length');
                })
                .catch(reject);
        } else if (Buffer.isBuffer(path)) {
            const length = Buffer.byteLength(path);
            const size = bytesToSize(length, 3);
            if (!isNaN(length)) resolve(size);
        } else {
            reject('error gatau apah');
        }
    });
};

export const parseMention = (text: string = ''): string[] => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');
};

export const getGroupAdmins = (participants: any[]): string[] => {
    const admins: string[] = [];
    for (let i of participants) {
        if (i.admin === "superadmin" || i.admin === "admin") {
            admins.push(i.id);
        }
    }
    return admins;
};

/**
 * Serialize Message
 * @param {WASocket} client 
 * @param {Object} m 
 * @param {Store} store 
 */
export const smsg = (client: any, m: any, store: Store): ExtendedMessage => {
    if (!m) return m;

    const M = proto.WebMessageInfo;
    const extendedMessage: ExtendedMessage = m;

    if (m.key) {
        extendedMessage.id = m.key.id;
        extendedMessage.from = m.key.remoteJid.startsWith('status') 
            ? jidNormalizedUser(m.key?.participant || (m as any).participant) 
            : jidNormalizedUser(m.key.remoteJid);
        extendedMessage.isBaileys = m.key.id?.startsWith('BAE5') && m.key.id.length === 16;
        extendedMessage.chat = m.key.remoteJid;
        extendedMessage.fromMe = m.key.fromMe;
        extendedMessage.isGroup = m.key.remoteJid.endsWith('@g.us');
        extendedMessage.sender = (client.decodeJid && client.decodeJid(
            m.key.fromMe && client.user?.id || 
            (m as any).participant || 
            m.key.participant || 
            m.key.remoteJid || ''
        )) || '';
        
        if (extendedMessage.isGroup) {
            extendedMessage.participant = (client.decodeJid && client.decodeJid(m.key.participant)) || '';
        }
    }

    if (m.message) {
        extendedMessage.mtype = getContentType(m.message);
        extendedMessage.msg = (extendedMessage.mtype == 'viewOnceMessage' 
            ? m.message[extendedMessage.mtype].message[getContentType(m.message[extendedMessage.mtype].message)] 
            : m.message[extendedMessage.mtype]);
        
        extendedMessage.body = m.message.conversation || 
            extendedMessage.msg.caption || 
            extendedMessage.msg.text || 
            (extendedMessage.mtype == 'listResponseMessage' && extendedMessage.msg.singleSelectReply.selectedRowId) || 
            (extendedMessage.mtype == 'buttonsResponseMessage' && extendedMessage.msg.selectedButtonId) || 
            (extendedMessage.mtype == 'viewOnceMessage' && extendedMessage.msg.caption) || 
            (m as any).text;

        const quoted = extendedMessage.quoted = extendedMessage.msg.contextInfo 
            ? extendedMessage.msg.contextInfo.quotedMessage 
            : null;

        extendedMessage.mentionedJid = extendedMessage.msg.contextInfo 
            ? extendedMessage.msg.contextInfo.mentionedJid 
            : [];

        if (extendedMessage.quoted) {
            let type = getContentType(quoted);
            extendedMessage.quoted = quoted[type];

            if (['productMessage'].includes(type)) {
                type = getContentType(extendedMessage.quoted);
                extendedMessage.quoted = extendedMessage.quoted[type];
            }

            if (typeof extendedMessage.quoted === 'string') {
                extendedMessage.quoted = {
                    text: extendedMessage.quoted
                };
            }

            const quotedMessage: QuotedMessage = {
                key: {
                    remoteJid: extendedMessage.msg?.contextInfo?.remoteJid || extendedMessage.from!,
                    participant: jidNormalizedUser(extendedMessage.msg?.contextInfo?.participant),
                    fromMe: areJidsSameUser(
                        jidNormalizedUser(extendedMessage.msg?.contextInfo?.participant),
                        jidNormalizedUser(client?.user?.id)
                    ),
                    id: extendedMessage.msg?.contextInfo?.stanzaId || '',
                },
                mtype: type,
                from: /g\.us|status/.test(extendedMessage.msg?.contextInfo?.remoteJid) 
                    ? extendedMessage.quoted.key.participant 
                    : extendedMessage.quoted.key.remoteJid,
                id: extendedMessage.msg.contextInfo.stanzaId,
                chat: extendedMessage.msg.contextInfo.remoteJid || extendedMessage.chat!,
                isBaileys: extendedMessage.quoted.id 
                    ? extendedMessage.quoted.id.startsWith('BAE5') && extendedMessage.quoted.id.length === 16 
                    : false,
                sender: (client.decodeJid && client.decodeJid(extendedMessage.msg.contextInfo.participant)) || '',
                fromMe: extendedMessage.quoted.sender === (client.user && client.user.id),
                text: extendedMessage.quoted.text || 
                    extendedMessage.quoted.caption || 
                    extendedMessage.quoted.conversation || 
                    extendedMessage.quoted.contentText || 
                    extendedMessage.quoted.selectedDisplayText || 
                    extendedMessage.quoted.title || '',
                mentionedJid: extendedMessage.msg.contextInfo 
                    ? extendedMessage.msg.contextInfo.mentionedJid 
                    : []
            };

            extendedMessage.quoted = quotedMessage;

            extendedMessage.getQuotedObj = extendedMessage.getQuotedMessage = async (): Promise<ExtendedMessage | false> => {
                if (!extendedMessage.quoted?.id) return false;
                const q = await store.loadMessage(extendedMessage.chat!, extendedMessage.quoted.id, client);
                return smsg(client, q, store);
            };

            const vM = extendedMessage.quoted.fakeObj = M.fromObject({
                key: {
                    remoteJid: extendedMessage.quoted.chat,
                    fromMe: extendedMessage.quoted.fromMe,
                    id: extendedMessage.quoted.id
                },
                message: quoted,
                ...(extendedMessage.isGroup ? { participant: extendedMessage.quoted.sender } : {})
            });

            extendedMessage.quoted.delete = () => client.sendMessage(extendedMessage.quoted!.chat, { delete: vM.key });

            extendedMessage.quoted.copyNForward = (jid: string, forceForward: boolean = false, options: any = {}) => 
                client.copyNForward(jid, vM, forceForward, options);

            extendedMessage.quoted.download = () => client.downloadMediaMessage(extendedMessage.quoted);
        }
    }

    if ((m.msg as any)?.url) {
        extendedMessage.download = () => client.downloadMediaMessage(m.msg);
    }

    extendedMessage.text = extendedMessage.msg?.text || 
        extendedMessage.msg?.caption || 
        m.message?.conversation || 
        extendedMessage.msg?.contentText || 
        extendedMessage.msg?.selectedDisplayText || 
        extendedMessage.msg?.title || '';

    extendedMessage.reply = (text: string | Buffer, chatId: string = extendedMessage.chat!, options: any = {}) => {
        return Buffer.isBuffer(text) 
            ? client.sendMedia(chatId, text, 'file', '', extendedMessage, { ...options })
            : client.sendText(chatId, text, extendedMessage, { ...options });
    };

    extendedMessage.copy = () => smsg(client, M.fromObject(M.toObject(m)), store);

    extendedMessage.copyNForward = (jid: string = extendedMessage.chat!, forceForward: boolean = false, options: any = {}) => {
        return client.copyNForward(jid, extendedMessage, forceForward, options);
    };

    return extendedMessage;
};

// Hot reload
const file: string = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    require(file);
});

export default {
    unixTimestampSeconds,
    resize,
    generateMessageTag,
    processTime,
    getRandom,
    getBuffer,
    formatSize,
    fetchJson,
    runtime,
    clockString,
    reSize,
    sleep,
    isUrl,
    getTime,
    formatDate,
    tanggal,
    formatp,
    jsonformat,
    logic,
    generateProfilePicture,
    bytesToSize,
    getSizeMedia,
    parseMention,
    getGroupAdmins,
    smsg
};
