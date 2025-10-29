//=== (  ✩ 🚀 Created By #! -VynnoxRzy No Delete Wm
//==  (  ✩ 🚀 Github: LexxyVdev
//==  (  ✩ 🚀 Youtube: https://www.youtube.com/@VynnoxRzyy
//==  (  ✩ 🚀 Tele: t.me/vynnoxrzy
//==  (  ✩ 🚀 Date: Fri 4-April
//==  (  ✩ 🚀 Note: Kembangkan Saja Kalo Mau jangan Apus Pembuat Base -_

import './config/settings.js';
import fs from 'fs';
import axios from 'axios';
import chalk from 'chalk';
import jimp from 'jimp';
import util from 'util';
import crypto from 'crypto';
import fetch from 'node-fetch';
import moment from 'moment-timezone';
import path from 'path';
import os from 'os';
import speed from 'performance-now';
import { spawn, exec, execSync } from 'child_process';
import fquoted from './fquoted.js';
import baileys from '@vynnox/lyvineemine';

const {
  proto,
  getContentType,
  jidNormalizedUser,
  generateWAMessageFromContent,
  generateWAMessageContent,
  generateWAMessage,
  prepareWAMessageMedia,
  WASocket,
  WAMessage
} = baileys;
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import fungsi yang benar
import {
  smsg,
  fetchJson,
  sleep,
  formatSize,
  runtime,
  getBuffer,
  toIDR,
  capital,
  formatp
} from './l lízanámi/myfunction.js';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const imageCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; 
const MAX_CACHE_SIZE = 50;

async function getCachedImageUrl(url) {
    const now = Date.now();
    if (imageCache.has(url)) {
        const cached = imageCache.get(url);
        if (now - cached.timestamp < CACHE_DURATION) {
            console.log(chalk.green(`[Hitngs Cache] Aplyy Image For Url: ${url}`));
            return url; 
        } else {
            imageCache.delete(url);
            console.log(chalk.yellow(`[Kadaluarsa Chace] Cache Delete: ${url}`));
        }
    }
    try {
        console.log(chalk.blue(`[Chace] Testing Image: ${url}`));
        const response = await fetch(url, { method: 'HEAD' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        imageCache.set(url, {
            timestamp: now,
            size: 0
        });
        if (imageCache.size > MAX_CACHE_SIZE) {
            const entries = Array.from(imageCache.entries());
            const oldestEntry = entries.reduce((oldest, current) => 
                current[1].timestamp < oldest[1].timestamp ? current : oldest
            );
            imageCache.delete(oldestEntry[0]);
            console.log(chalk.yellow(`[CACHE CLEANUP] Menghapus cache Yg lma: ${oldestEntry[0]}`));
        }
       
        console.log(chalk.green(`[Chce Storage] URL di save: ${url}`));
        return url;
    } catch (error) {
        console.error(chalk.red('[CACHE ERROR] Error test image:'), error);
        return url;
    }
}

async function prepareCachedMedia(mediaUrl, options = {}) {
    try {
        const cachedUrl = await getCachedImageUrl(mediaUrl);
        return await prepareWAMessageMedia(
            { url: cachedUrl }, 
            { 
                upload: vynnoxbeyours.waUploadToServer,
                ...options 
            }
        );
    } catch (error) {
        console.error(chalk.red('[MEDIA ERROR] Error preprng Media:'), error);
        return await prepareWAMessageMedia(
            { url: mediaUrl }, 
            { 
                upload: vynnoxbeyours.waUploadToServer,
                ...options 
            }
        );
    }
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getCacheInfo() {
    const totalSize = Array.from(imageCache.values()).reduce((sum, item) => sum + item.size, 0);
    return {
        totalItems: imageCache.size,
        totalSize: formatBytes(totalSize),
        hitRate: imageCache.size
    };
}

// Hapus interface TypeScript karena ini file JavaScript
// Tetap gunakan JSDoc comments untuk dokumentasi

/**
 * @typedef {Object} MessageUpdate
 * @property {any[]} messages
 * @property {string} type
 */

/**
 * @typedef {Object} Store
 * @property {any} [key]
 */

/**
 * @typedef {Object} Participant
 * @property {string} [id]
 * @property {string} [jid]
 * @property {string} [lid]
 * @property {string|null} [admin]
 * @property {any} [full]
 */

/**
 * @typedef {Object} GroupMetadata
 * @property {string} [subject]
 * @property {Participant[]} [participants]
 */

/**
 * @callback PluginFunction
 * @param {any} m
 * @param {any} plug
 * @returns {Promise<void>}
 */

/**
 * @typedef {Object} Plugin
 * @property {string[]} [command]
 * @property {boolean} [owner]
 * @property {boolean} [group]
 * @property {boolean} [private]
 * @property {boolean} [admin]
 * @property {PluginFunction} function
 */

/**
 * @typedef {Object} PlugContext
 * @property {ExtendedWASocket} vynnoxbeyours
 * @property {string} prefix
 * @property {string} command
 * @property {Function} nevreply
 * @property {string} text
 * @property {boolean} itsOwner
 * @property {boolean} isGroup
 * @property {boolean} isPrivate
 * @property {string} pushname
 * @property {boolean} isAdmins
 * @property {GroupMetadata} groupMetadata
 */

/**
 * @typedef {WASocket & Object} ExtendedWASocket
 * @property {Object} [user]
 * @property {string} user.id
 * @property {Function} [decodeJid]
 * @property {boolean} [public]
 * @property {any} [waUploadToServer]
 */

const vynnoxbeyours = async (
  /** @type {ExtendedWASocket} */ vynnoxbeyours, 
  /** @type {any} */ m, 
  /** @type {MessageUpdate} */ chatUpdate, 
  /** @type {Store} */ store
) => {
  try {
    const body = (
      m.mtype === "conversation" ? m.message?.conversation :
      m.mtype === "imageMessage" ? m.message?.imageMessage?.caption :
      m.mtype === "videoMessage" ? m.message?.videoMessage?.caption :
      m.mtype === "extendedTextMessage" ? m.message?.extendedTextMessage?.text :
      m.mtype === "buttonsResponseMessage" ? m.message?.buttonsResponseMessage?.selectedButtonId :
      m.mtype === "listResponseMessage" ? m.message?.listResponseMessage?.singleSelectReply?.selectedRowId :
      m.mtype === "templateButtonReplyMessage" ? m.message?.templateButtonReplyMessage?.selectedId :
      m.mtype === "interactiveResponseMessage" ? JSON.parse(m.msg?.nativeFlowResponseMessage?.paramsJson)?.id :
      m.mtype === "templateButtonReplyMessage" ? m.msg?.selectedId :
      m.mtype === "messageContextInfo" ? m.message?.buttonsResponseMessage?.selectedButtonId ||
      m.message?.listResponseMessage?.singleSelectReply?.selectedRowId || m.text : ""
    ) || "";
    
    const sender = m.key.fromMe 
      ? (vynnoxbeyours.user?.id?.split(":")[0] + "@s.whatsapp.net" || vynnoxbeyours.user?.id) 
      : m.key.participant || m.key.remoteJid;
    
    const senderNumber = sender?.split('@')[0] || '';
    const budy = (typeof m.text === 'string' ? m.text : '');
    const prefa = ["", "!", ".", ",", "🐤", "🗿"];

    const prefixRegex = /^[°zZ#$@*+,.?=''():√%!¢£¥€π¤ΠΦ_&><`™©®Δ^βα~¦|/\\©^]/;
    const prefix = prefixRegex.test(body) ? body.match(prefixRegex)[0] : '.';
    const from = m.key.remoteJid;
    const isGroup = from.endsWith("@g.us");
    
    let owner = [];
    try {
      owner = JSON.parse(fs.readFileSync('./database/owner.json', 'utf-8'));
    } catch (error) {
      console.log(chalk.yellow('File owner.json tidak ditemukan, menggunakan default owner'));
      owner = [];
    }
    
    const botNumber = vynnoxbeyours.decodeJid ? await vynnoxbeyours.decodeJid(vynnoxbeyours.user?.id || '') : '';
    const itsOwner = [botNumber, ...owner, ...(global.onwer || [])]
      .map((v) => v?.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
      .includes(m.sender);
    const isBot = botNumber.includes(senderNumber);
    
    const isCmd = body.startsWith(prefix);
    const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift()?.toLowerCase() : '';
    const command2 = body.replace(prefix, '').trim().split(/ +/).shift()?.toLowerCase() || '';
    const args = body.trim().split(/ +/).slice(1);
    const pushname = m.pushName || "No Name";
    const text = args.join(" ");
    const q = text;
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || '';
    const qmsg = (quoted.msg || quoted);
    const isMedia = /image|video|sticker|audio/.test(mime);
    
    const groupMetadata = m?.isGroup 
      ? await vynnoxbeyours.groupMetadata(m.chat).catch(() => ({})) 
      : {};
    
    const groupName = m?.isGroup ? groupMetadata.subject || '' : '';
    const participants = m?.isGroup 
      ? groupMetadata.participants?.map((p) => {
          let admin = null;
          if (p.admin === 'superadmin') admin = 'superadmin';
          else if (p.admin === 'admin') admin = 'admin';
          return {
            id: p.id || null,
            jid: p.jid || null,
            lid: p.lid || null,
            admin,
            full: p
          };
        }) || []
      : [];
    
    const groupOwner = m?.isGroup 
      ? participants.find(p => p.admin === 'superadmin')?.jid || '' 
      : '';
    
    const groupAdmins = participants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => p.jid || p.id);
    
    const isBotAdmins = m?.isGroup ? groupAdmins.includes(botNumber) : false;
    const isAdmins = m?.isGroup ? groupAdmins.includes(m.sender) : false;
    const isGroupOwner = m?.isGroup ? groupOwner === m.sender : false;
    
    const senderLid = (() => {
      const p = participants.find(p => p.jid === m.sender);
      return p?.lid || null;
    })();

    const time = moment().tz('Asia/Jakarta').format('HH:mm:ss');
    const datetime = moment()
      .tz('Asia/Jakarta')
      .format('dddd, MMMM D YYYY, h:mm:ss a');
    const jam = moment(Date.now())
      .tz('Asia/Jakarta')
      .locale('id')
      .format('HH:mm:ss z');
    const penghitung = moment()
      .tz('Asia/Jakarta')
      .format('dddd, D MMMM - YYYY');
    
    let ucapanWaktu;
    if (time >= '19:00:00' && time < '23:59:00') {
      ucapanWaktu = 'Good night! The stars are watching over you';
    } else if (time >= '15:00:00' && time < '19:00:00') {
      ucapanWaktu = 'Good afternoon! Have a wonderful evening';
    } else if (time >= '11:00:00' && time < '15:00:00') {
      ucapanWaktu = 'Hello! Let\'s have a great day today';
    } else if (time >= '06:00:00' && time < '11:00:00') {
      ucapanWaktu = 'Good morning! Let\'s do our best today';
    } else {
      ucapanWaktu = 'Enjoy the night! Enjoy the quiet of the night';
    }

    let ppuser;
    try {
      ppuser = await vynnoxbeyours.profilePictureUrl(m.sender, 'image');
    } catch (err) {
      ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60';
    }
    
    let ppnyauser;
    try {
      ppnyauser = await getBuffer(ppuser);
    } catch (error) {
      console.log(chalk.yellow('Gagal mendapatkan buffer profile picture'));
      ppnyauser = null;
    }

    const resize = async (image, width, height) => {
      try {
        const oyy = await jimp.read(image);
        const kiyomasa = await oyy
          .resize(width, height)
          .getBufferAsync(jimp.MIME_JPEG);
        return kiyomasa;
      } catch (error) {
        console.log(chalk.red('Error resizing image:'), error);
        return null;
      }
    };

    if (isCmd && command) {
      const isGroup = m.key.remoteJid.endsWith('@g.us');
      let groupName = "Private Chat";
      
      try {
        if (isGroup) {
          const metadata = await vynnoxbeyours.groupMetadata(m.chat);
          groupName = metadata.subject || "Group Chat";
        }
      } catch (error) {
        groupName = "Group Chat";
      }
      
      console.log(chalk.bgHex("#4a69bd").bold(`<!> 新しいメッセージ <!>`));
      console.log(
        chalk.blue.bold(` 𖤐 Time: ${penghitung}, ${jam} WIB\n`),
        chalk.blue.bold(`𖤐 Number: ${m.sender.split("@")[0]}\n`),
        chalk.blue.bold(`𖤐 Name: ${m.pushName}\n`),
        chalk.blue.bold(`𖤐 From: ${groupName}\n`),
        chalk.blue.bold(`𖤐 Command: ${prefix + command}`)
      );
    }

    async function nevreply(text) {
      try {
        await vynnoxbeyours.sendMessage(m.chat, {
          text: `${text} ${jam}\n${ucapanWaktu}`
        }, { quoted: m });
      } catch (error) {
        console.log(chalk.red('Error sending reply:'), error);
        await vynnoxbeyours.sendMessage(m.chat, {
          text: `${text} ${jam}\n${ucapanWaktu}`
        }, { quoted: m });
      }
    }

    const pluginsLoader = async (directory) => {
      let plugins = [];
      try {
        const folders = fs.readdirSync(directory);
        
        for (const file of folders) {
          const filePath = path.join(directory, file);
          if (filePath.endsWith(".js")) {
            try {
              const resolvedPath = require.resolve(filePath);
              if (require.cache[resolvedPath]) {
                delete require.cache[resolvedPath];
              }
              const plugin = require(filePath);
              plugins.push(plugin);
            } catch (error) {
              console.log(chalk.red(`Error loading plugin ${filePath}:`), error);
            }
          }
        }
      } catch (error) {
        console.log(chalk.red(`Error reading plugin directory ${directory}:`), error);
      }
      return plugins;
    };

    const pluginsDisable = false; 
    let plugins = [];
    try {
      plugins = await pluginsLoader(path.resolve(__dirname, "./command"));
    } catch (error) {
      console.log(chalk.red('Error loading plugins:'), error);
    }

    const plug = { 
      vynnoxbeyours,
      prefix,
      command, 
      nevreply,
      text, 
      itsOwner,
      isGroup: !!m.isGroup, 
      isPrivate: !m.isGroup, 
      pushname,
      isAdmins,
      groupMetadata
    };
    if (!pluginsDisable && command && plugins.length > 0) {
      for (let plugin of plugins) {
        if (plugin.command && plugin.command.find(e => e === command.toLowerCase())) {
          if (plugin.owner && !itsOwner) {
            return nevreply("Owner only command");
          }
          
          if (plugin.group && !plug.isGroup) {
            return nevreply("Group only command");
          }
          
          if (plugin.private && !plug.isPrivate) {
            return nevreply("Private only command");
          }
          
          if (plugin.admin && !plug.isAdmins) {
            return nevreply("Admin only command");
          }

          if (typeof plugin === "function") {
            try {
              await plugin(m, plug);
              return; // Stop setelah plugin dieksekusi
            } catch (error) {
              console.log(chalk.red(`Error executing plugin for command ${command}:`), error);
              await nevreply(`Error executing command: ${error.message}`);
            }
          }
        }
      }
    }
    if (!command) return;

    switch (command.toLowerCase()) {
      case 'menu': {
    let imagetqto = 'https://files.catbox.moe/6unfie.jpg';
    let pan = `Nirvana [ TypeScript ]`;
    const processingText = '🔍 *Sedang menganalisis bahasa pemrograman...*';
    await nevreply(processingText);

    function detectProgrammingLanguage(code: string): { language: string; confidence: number } {
        const languagePatterns = {
            typescript: [
                { pattern: /\b(interface|type|export|import|as|enum|declare|namespace|readonly)\b/, weight: 2 },
                { pattern: /:\s*\w+\s*[<{)]/, weight: 2 },
                { pattern: /<[A-Z][^>]*>|<\/[A-Z][^>]*>/g, weight: 3 },
                { pattern: /\b(React\.FC|useState<|useEffect<|useRef<|props:\s*{)/, weight: 3 },
                { pattern: /\b(public|private|protected)\b/, weight: 2 }
            ],
            javascript: [
                { pattern: /\b(function|const|let|var|=>|console\.log)\b/, weight: 1 },
                { pattern: /\b(require|module\.exports|exports\.)\b/, weight: 2 },
                { pattern: /\.js('|"|`)/, weight: 1 }
            ],
            python: [
                { pattern: /\b(def|import|from|print|lambda|__name__|class\s+\w+)\b/, weight: 2 },
                { pattern: /:\s*$/, weight: 2 }
            ],
            java: [
                { pattern: /\b(public|class|static|void|System\.out\.println|extends|implements)\b/, weight: 2 },
                { pattern: /\b(int|String|boolean|double)\s+\w+/, weight: 2 }
            ]
        };

        const scores: { [key: string]: number } = {};
        
        for (const [language, patterns] of Object.entries(languagePatterns)) {
            scores[language] = 0;
            for (const { pattern, weight } of patterns) {
                const matches = code.match(pattern);
                if (matches) {
                    scores[language] += matches.length * weight;
                }
            }
        }

        let detectedLanguage = 'unknown';
        let highestScore = 0;

        for (const [language, score] of Object.entries(scores)) {
            if (score > highestScore) {
                highestScore = score;
                detectedLanguage = language;
            }
        }

        const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
        const confidence = totalScore > 0 ? Math.round((highestScore / totalScore) * 100) : 0;

        return { language: detectedLanguage, confidence };
    }

    async function getActualCodeFromFile(): Promise<string> {
        try {
            if (typeof require !== 'undefined') {
                const fs = require('fs');
                const path = require('path');
          
                if (fs.existsSync(__filename)) {
                    return fs.readFileSync(__filename, 'utf8');
                }
            }
            
            const codeSamples = [
                detectProgrammingLanguage.toString(),
                getActualCodeFromFile.toString()
            ].join('\n');

            return codeSamples;

        } catch (error) {
            return `
                interface UserData {
                    id: number;
                    name: string;
                    email: string;
                }

                type MessageType = 'text' | 'image';

                class Handler {
                    private data: Map<string, any> = new Map();
                    
                    public process<T>(message: T): boolean {
                        return true;
                    }
                }
            `;
        }
    }

    const actualCode = await getActualCodeFromFile();
    const detectionResult = detectProgrammingLanguage(actualCode);

    let msg = generateWAMessageFromContent(
        m.chat,
        {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: pan },
                        carouselMessage: {
                            cards: [
                                {
                                    header: proto.Message.InteractiveMessage.Header.create({
                                        ...(await prepareWAMessageMedia(
                                            { image: { url: imagetqto } },
                                            { upload: vynnoxbeyours.waUploadToServer },
                                        )),
                                        title: ``,
                                        gifPlayback: true,
                                        subtitle: "🍂",
                                        hasMediaAttachment: false,
                                    }),
                                    body: {
                                        text: `( 🍂 ) - 你好 *Ni Hao ─ Wangsaff*\n我是一名自動化的 Lanny Yawa 助理，隨時準備為您提供您正在尋找的資訊和答案
    
[ ᯓ] League: ${detectionResult.language.toUpperCase()}
[ 📊 ] Confidence: ${detectionResult.confidence}%
[ ≭ ] User: ${pushname}
[ 𖣸 ] Time: ${time}`,
                                    },
                                    nativeFlowMessage: {
                                        messageParamsJson: JSON.stringify({          
                                            bottom_sheet: {            
                                                in_thread_buttons_limit: 2,            
                                                divider_indices: [1, 2, 3, 4, 5, 999],            
                                                list_title: "感謝メニュー",            
                                                button_title: "感謝メニュー"          
                                            },          
                                            tap_target_configuration: {            
                                                title: "貢献者様ご紹介",            
                                                description: "開発チームと支援者",            
                                                canonical_url: "Aletta Konaiwa",            
                                                domain: "lannybuypanel.vestia.icu",            
                                                button_index: 0          
                                            }        
                                        }),        
                                        buttons: [
                                            {            
                                                name: "single_select",            
                                                buttonParamsJson: JSON.stringify({              
                                                    has_multiple_buttons: true            
                                                })          
                                            },
                                            {            
                                                name: "single_select",            
                                                buttonParamsJson: JSON.stringify({              
                                                    title: "開発者情報",              
                                                    sections: [                
                                                        {                  
                                                            title: "コア開発者",                  
                                                            highlight_label: "主要メンバー",                  
                                                            rows: [                    
                                                                {                      
                                                                    title: "@Fonixs Nirvana",                      
                                                                    description: "プロジェクトリーダー",                      
                                                                    id: "row_1"                    
                                                                },
                                                                {                      
                                                                    title: "@Nirvana",                      
                                                                    description: "開発チーム",                      
                                                                    id: "row_2"                    
                                                                }                  
                                                            ]                
                                                        }              
                                                    ],              
                                                    has_multiple_buttons: true            
                                                })          
                                            },          
                                        ],
                                    },
                                },
                            ],
                            messageVersion: 1,
                        },
                    },
                },
            },
        },
        {},
    );

    await vynnoxbeyours.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    break;
}
      case 'backup':
      case 'bp': {
        if (!itsOwner) return nevreply("Owner only command");
        
        try {
          const sessionPath = './session';
          if (fs.existsSync(sessionPath)) {
            const files = fs.readdirSync(sessionPath);
            files.forEach((file) => {
              if (file !== 'creds.json') {
                const filePath = path.join(sessionPath, file);
                if (fs.lstatSync(filePath).isDirectory()) {
                  fs.rmSync(filePath, { recursive: true, force: true });
                } else {
                  fs.unlinkSync(filePath);
                }
              }
            });
          }

          const tgl = new Date().toLocaleDateString('id-ID');
          const ls = execSync('ls')
            .toString()
            .split('\n')
            .filter(
              (pe) =>
                pe != 'node_modules' &&
                pe != 'package-lock.json' &&
                pe != 'yarn.lock' &&
                pe != 'tmp' &&
                pe != 'session' &&
                pe != '',
            );

          execSync(`zip -r base.zip ${ls.join(' ')}`);
          await vynnoxbeyours.sendMessage(
            m.chat,
            {
              document: fs.readFileSync('./base.zip'),
              fileName: `base-${Date.now()}.zip`,
              mimetype: 'application/zip',
              caption: `Backup file - ${tgl}`,
            },
            { quoted: m },
          );
          execSync('rm -rf base.zip');
        } catch (error) {
          console.log(chalk.red('Error in backup command:'), error);
          await nevreply("Error membuat backup");
        }
        break;
      }

      case 'buttonold': {
        try {
          const teks = `> ようこそ`;
          const buttons = [
            {
              buttonId: `${prefix}bugmenu`,
              buttonText: { displayText: 'kosong' }
            },
            {
              buttonId: `${prefix}menu`,
              buttonText: { displayText: 'kosong' }
            }
          ];

          const imageUrl = 'https://files.catbox.moe/msoysl.jpg';
          const cachedImageUrl = await getCachedImageUrl(imageUrl);

          const buttonMessage = {
            image: { url: cachedImageUrl },
            caption: teks,
            footer: `Nǐ hǎo, nǐ gānggāng shǐyòngle zhǐlìngq ${prefix + command}`,
            buttons: buttons,
            headerType: 1
          };

          await vynnoxbeyours.sendMessage(m.chat, buttonMessage, { quoted: m });
        } catch (error) {
          console.log(chalk.red('Error in buttonold command:'), error);
          await nevreply("Error menampilkan button");
        }
        break;
      }

      case 'cacheinfo': {
        if (!itsOwner) return nevreply("Ngapain Jir Khusus Owner");
        try {
          const cacheInfo = getCacheInfo();
          await vynnoxbeyours.sendMessage(m.chat, {
            text: `📊 *Cache Information*\n\n` +
                  `• Total Items: ${cacheInfo.totalItems}\n` +
                  `• Total Size: ${cacheInfo.totalSize}\n` +
                  `• Cache Duration: 24 hours\n` +
                  `• Max Cache Size: ${MAX_CACHE_SIZE} items\n\n` +
                  `_Cache Fuhsi Nya Biar Apa yak pikir sendiri dah🗿 cape ketik`
          }, { quoted: m });
        } catch (error) {
          console.log(chalk.red('Error in cacheinfo command:'), error);
        }
        break;
      }

      case 'clearcache': {
        if (!itsOwner) return nevreply("Owner only command");
        try {
          const previousSize = imageCache.size;
          imageCache.clear();
          await vynnoxbeyours.sendMessage(m.chat, {
            text: `🗑️ *Cache Hapus*\n\n` +
                  `• Previous items: ${previousSize}\n` +
                  `• Current items: ${imageCache.size}\n` +
                  `_Cache berhasil Di Hapus 😹`
          }, { quoted: m });
        } catch (error) {
          console.log(chalk.red('Error in clearcache command:'), error);
        }
        break;
      }

      default:
        // Command tidak dikenali
        break;
    }
  } catch (e) {
    console.error(chalk.redBright("Error utama:"), e);
  }
};

export default vynnoxbeyours;

// File watcher untuk development
const file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  import(`${file}?update=${Date.now()}`);
});
