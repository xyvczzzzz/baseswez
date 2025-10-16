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
import fquoted  from './fquoted.js';
import {
  proto,
  getContentType,
  jidNormalizedUser,
  generateWAMessageFromContent,
  generateWAMessageContent,
  generateWAMessage,
  prepareWAMessageMedia,
  WASocket,
  WAMessage
} from '@vynnox/lyvineemine';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const imageCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 jam
const MAX_CACHE_SIZE = 50; // Maksimal 50 gambar di cache

async function getCachedImageUrl(url) {
    const now = Date.now();
    if (imageCache.has(url)) {
        const cached = imageCache.get(url);
        if (now - cached.timestamp < CACHE_DURATION) {
            console.log(chalk.green(`[CACHE HIT] Menggunakan gambar dari cache: ${url}`));
            return url; 
        } else {
            imageCache.delete(url);
            console.log(chalk.yellow(`[CACHE EXPIRED] Cache dihapus: ${url}`));
        }
    }
    try {
        console.log(chalk.blue(`[CACHE MISS] Testing gambar: ${url}`));
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
            console.log(chalk.yellow(`[CACHE CLEANUP] Menghapus cache terlama: ${oldestEntry[0]}`));
        }
        
        console.log(chalk.green(`[CACHE STORED] URL disimpan ke cache: ${url}`));
        return url;
    } catch (error) {
        console.error(chalk.red('[CACHE ERROR] Error testing image:'), error);
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
        console.error(chalk.red('[MEDIA ERROR] Error preparing media:'), error);i
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

interface MessageUpdate {
  messages: any[];
  type: string;
}

interface Store {
  [key: string]: any;
}

interface Participant {
  id?: string;
  jid?: string;
  lid?: string;
  admin?: string | null;
  full?: any;
}

interface GroupMetadata {
  subject?: string;
  participants?: Participant[];
}

interface Plugin {
  command?: string[];
  owner?: boolean;
  group?: boolean;
  private?: boolean;
  admin?: boolean;
  (m: any, plug: any): Promise<void>;
}

interface PlugContext {
  vynnoxbeyours: ExtendedWASocket;
  prefix: string;
  command: string;
  nevreply: (text: string) => Promise<void>;
  text: string;
  itsOwner: boolean;
  isGroup: boolean;
  isPrivate: boolean;
  pushname: string;
  isAdmins: boolean;
  groupMetadata: GroupMetadata;
}

interface ExtendedWASocket extends WASocket {
  user?: {
    id: string;
  };
  decodeJid?: (jid: string) => string;
  public?: boolean;
  waUploadToServer?: any;
}

const vynnoxbeyours = async (
  vynnoxbeyours: ExtendedWASocket, 
  m: any, 
  chatUpdate: MessageUpdate, 
  store: Store
): Promise<void> => {
  try {
    const body = (
      m.mtype === "conversation" ? m.message.conversation :
      m.mtype === "imageMessage" ? m.message.imageMessage.caption :
      m.mtype === "videoMessage" ? m.message.videoMessage.caption :
      m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage.text :
      m.mtype === "buttonsResponseMessage" ? m.message.buttonsResponseMessage.selectedButtonId :
      m.mtype === "listResponseMessage" ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
      m.mtype === "templateButtonReplyMessage" ? m.message.templateButtonReplyMessage.selectedId :
      m.mtype === "interactiveResponseMessage" ? JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson).id :
      m.mtype === "templateButtonReplyMessage" ? m.msg.selectedId :
      m.mtype === "messageContextInfo" ? m.message.buttonsResponseMessage?.selectedButtonId ||
      m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text : ""
    ) || "";
    
    const sender = m.key.fromMe 
      ? (vynnoxbeyours.user?.id.split(":")[0] + "@s.whatsapp.net" || vynnoxbeyours.user?.id) 
      : m.key.participant || m.key.remoteJid;
    
    const senderNumber = sender.split('@')[0];
    const budy = (typeof m.text === 'string' ? m.text : '');
    const prefa = ["", "!", ".", ",", "🐤", "🗿"];

    const prefixRegex = /^[°zZ#$@*+,.?=''():√%!¢£¥€π¤ΠΦ_&><`™©®Δ^βα~¦|/\\©^]/;
    const prefix = prefixRegex.test(body) ? body.match(prefixRegex)![0] : '.';
    const from = m.key.remoteJid;
    const isGroup = from.endsWith("@g.us");
    
    const owner = JSON.parse(fs.readFileSync('./database/owner.json', 'utf-8'));
    const botNumber = vynnoxbeyours.decodeJid ? await vynnoxbeyours.decodeJid(vynnoxbeyours.user?.id || '') : '';
    const itsOwner = [botNumber, ...owner, ...(global as any).onwer]
      .map((v: string) => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
      .includes(m.sender);
    const isBot = botNumber.includes(senderNumber);
    
    const isCmd = body.startsWith(prefix);
    const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift()!.toLowerCase() : '';
    const command2 = body.replace(prefix, '').trim().split(/ +/).shift()!.toLowerCase();
    const args = body.trim().split(/ +/).slice(1);
    const pushname = m.pushName || "No Name";
    const text = args.join(" ");
    const q = text;
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || '';
    const qmsg = (quoted.msg || quoted);
    const isMedia = /image|video|sticker|audio/.test(mime);
    
    const { smsg, fetchJson, sleep, formatSize, runtime } = require('./l lízanámi/myfunction.js');

    const groupMetadata: GroupMetadata = m?.isGroup 
      ? await vynnoxbeyours.groupMetadata(m.chat).catch(() => ({})) 
      : {};
    
    const groupName = m?.isGroup ? groupMetadata.subject || '' : '';
    const participants: Participant[] = m?.isGroup 
      ? groupMetadata.participants?.map((p: any) => {
          let admin: string | null = null;
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
    
    const senderLid = ((): string | null => {
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
    
    let ucapanWaktu: string;
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
    
    if (isBot) {
      console.log('\x1b[30m--------------------\x1b[0m');
      console.log(chalk.bgHex("#4a69bd").bold(`▢ 新しいメッセージ`));
      console.log(
        chalk.bgHex("#ffffff").black(
          `   ⚘ Tanggal: ${new Date().toLocaleString()} \n` +
          `   ⚘ Pesan: ${m.body || m.mtype} \n` +
          `   ⚘ Sender: ${pushname} \n` +
          `   ⚘ JID: ${senderNumber} \n` +
          `   ⚘ LID: ${senderLid || '-'}`
        )
      );
      console.log();
    }

    if (isGroup) {
      console.log(
        chalk.bgHex("#ffffff").black(
          `   ⌕ Group: ${groupName} \n` +
          `   ⌕ GroupJid: ${m.chat}`
        )
      );
      console.log();
    }

    async function nevreply(text: string): Promise<void> {
      await vynnoxbeyours.sendMessage(m.chat, {
        eventMessage: {
          isCanceled: false,
          name: `${text} ${jam}`,
          description: `${ucapanWaktu}`,
          location: {
            degreesLatitude: 0,
            degreesLongitude: 0,
            name: `${jam}`
          },
          joinLink: "https://call.whatsapp.com/video/swèzestyèst1963",
          startTime: "1763019000",
          endTime: "1763026200",
          extraGuestsAllowed: false
        }
      }, { quoted: fquoted.packSticker });
    }

    const pluginsLoader = async (directory: string): Promise<Plugin[]> => {
      let plugins: Plugin[] = [];
      const folders = fs.readdirSync(directory);
      
      folders.forEach(file => {
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
            console.log(`${filePath}:`, error);
          }
        }
      });
      return plugins;
    };

    const pluginsDisable = true;
    const plugins = await pluginsLoader(path.resolve(__dirname, "./command"));
    
    const plug: PlugContext = { 
      vynnoxbeyours,
      prefix,
      command, 
      nevreply,
      text, 
      itsOwner,
      isGroup: m.isGroup, 
      isPrivate: !m.isGroup, 
      pushname,
      isAdmins,
      groupMetadata
    };

    for (let plugin of plugins) {
      if (plugin.command && plugin.command.find(e => e == command.toLowerCase())) {
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
          await plugin(m, plug);
        }
      }
    }

    if (!pluginsDisable) return;
        
    switch (command) {
      case 'menu':
        {
          const thumbnailUrl = "https://files.catbox.moe/frdbht.jpg";
          const cachedThumbnailUrl = await getCachedImageUrl(thumbnailUrl);          
          const messagePayload: any = {
            interactiveMessage: {
              title: `
╭ ー、〔 𝐔𝐬𝐞𝐫 - 🫧 〕
│⚘ ᴜsᴇʀ : ${pushname}
╰──────────`,
              footer: `@vynnox/lyvineemine ˗ˋˏ63ˎˊ˗⁩ | ${time}`,
              thumbnail: cachedThumbnailUrl,
              nativeFlowMessage: {
                messageParamsJson: JSON.stringify({
                  limited_time_offer: {
                    text: 'l lízanámi, since 1963',
                    url: 't.me/lizanamii',
                    copy_code: 'l lízanámi, since 1963',
                    expiration_time: Date.now() * 99999,
                  },
                  bottom_sheet: {
                    in_thread_buttons_limit: 2,
                    divider_indices: [1, 2, 3, 4, 5, 999],
                    list_title: 'l lízanámi',
                    button_title: 'l lízanámi',
                  },
                  tap_target_configuration: {
                    title: 'l lízanámi',
                    description: 'bomboclard',
                    canonical_url: 'https://shop.example.com/angebot',
                    domain: 'shop.example.com',
                    button_index: 0,
                  },
                }),
                buttons: [
                  {
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({
                      has_multiple_buttons: true,
                    }),
                  },
                  {
                    name: 'call_permission_request',
                    buttonParamsJson: JSON.stringify({
                      has_multiple_buttons: true,
                    }),
                  },
                  {
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({
                      title: 'l lízanámi',
                      sections: [
                        {
                          title: 'l lízanámi',
                          highlight_label: 'label',
                          rows: [
                            {
                              title: '@tqto',
                              description: `Support ${time}`,
                              id: '.tqto',
                            },
                            {
                              title: '@cmt',
                              description: `Create Mt Ban ${time}`,
                              id: '.cmt',
                            },
                            {
                              title: '@donasi',
                              description: `Donate ${time}`,
                              id: '.donasi',
                            },
                          ],
                        },
                      ],
                      has_multiple_buttons: true,
                    }),
                  },
                  {
                    name: 'galaxy_message',
                    buttonParamsJson: JSON.stringify({
                      flow_message_version: '3',
                      flow_token: 'unused',
                      flow_id: '1775342589999842',
                      flow_cta: 'l lízanámi',
                      flow_action: {
                        navigate: true,
                        screen: 'AWARD_CLAIM',
                        data: {
                          error_types: [
                            { id: '1', title: 'No llega' },
                            { id: '2', title: 'Diferente' },
                            { id: '3', title: 'Calidad' },
                          ],
                          campaigns: [
                            { id: 'campaign_1', title: 'Campaña 1' },
                            { id: 'campaign_2', title: 'Campaña 2' },
                            { id: 'campaign_3', title: 'Campaña 3' },
                          ],
                          categories: [
                            { id: 'category_1', title: 'Unicam' },
                            { id: 'category_2', title: 'Constantes' },
                            {
                              id: 'category_3',
                              title: 'Referidos',
                              'on-unselect-action': {
                                name: 'update_data',
                                payload: { subcategory_visibility: false },
                              },
                              'on-select-action': {
                                name: 'update_data',
                                payload: {
                                  subcategories: [
                                    { id: '1', title: '1 subcategory' },
                                    { id: '2', title: '2 subcategory' },
                                  ],
                                  subcategory_visibility: true,
                                },
                              },
                            },
                          ],
                          subcategory_visibility: false,
                        },
                      },
                      flow_metadata: {
                        flow_json_version: 1000,
                        data_api_protocol: 'Believe in yourself, anything is possible.',
                        data_api_version: 9999999,
                        flow_name: '𝟖𝟘𝟖 𝐍𝐞𝐜 🪽',
                        categories: [],
                      },
                      icon: 'REVIEW',
                      has_multiple_buttons: true,
                    }),
                  },
                  {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                      display_text: 'l lízanámi',
                      id: '123456789',
                      copy_code: "@lizanamii/lizbailyesx",
                    }),
                  },
                  {
                    name: 'galaxy_message',
                    buttonParamsJson: JSON.stringify({
                      icon: 'REVIEW',
                      flow_cta: '夜明け',
                      flow_message_version: '3',
                    }),
                  },
                  {
                    name: 'galaxy_message',
                    buttonParamsJson: JSON.stringify({
                      icon: 'PROMOTION',
                      flow_cta: 'レクシー',
                      flow_message_version: '3',
                    }),
                  },
                  {
                    name: 'galaxy_message',
                    buttonParamsJson: JSON.stringify({
                      icon: 'DOCUMENT',
                      flow_cta: '< リザナミ幹部? ',
                      flow_message_version: '3',
                    }),
                  },
                  {
                    name: 'galaxy_message',
                    buttonParamsJson: JSON.stringify({
                      icon: 'DEFAULT',
                      flow_cta: 'リザナミ',
                      flow_message_version: '3',
                    })
                  }
                ]
              }
            }
          };

          await vynnoxbeyours.sendMessage(m.chat, messagePayload, { quoted: fquoted.packSticker });
        }
        break;
      
      case 'backup':
      case 'bp':
        {
          if (!itsOwner) return nevreply(messages.owner);
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
              fileName: `base.zip`,
              mimetype: 'application/zip',
              caption: 'this is your backup file',
            },
            { quoted: m },
          );
          execSync('rm -rf base.zip');
          await reaction(m.chat, '⚡');
        }
        break;
      case 'buttonold': {
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

        const buttonMessage: any = {
          image: { url: cachedImageUrl },
          caption: teks,
          footer: `Nǐ hǎo, nǐ gānggāng shǐyòngle zhǐlìngq ${prefix + command}`,
          buttons: buttons,
          headerType: 1,
          viewOnce: true
        };

        await vynnoxbeyours.sendMessage(m.chat, buttonMessage, { quoted: m });
        break;
      }

      case 'eee': {
        const nevatxt = `> こんにちは、アドレス販売者が必要な場合は、最初に期間を選択してください`;
        const flowActions = [{
          buttonId: 'action',
          buttonText: { displayText: 'kosong' },
          type: 4,
          nativeFlowInfo: {
            name: 'single_select',
            paramsJson: JSON.stringify({
              title: 'kosong',
              sections: [{
                title: 'kosong',
                rows: [
                  {
                    header: 'kosong',
                    title: 'kosong',
                    description: 'kosong',
                    id: `.buttonold`
                  }
                ]
              }, {
                title: 'kosong',
                rows: [
                  {
                    header: 'kosong',
                    title: 'kosong',
                    description: 'kosong',
                    id: `.buttonold`
                  }
                ]
              }]
            })
          }
        }];

        const imageUrl = 'https://files.catbox.moe/msoysl.jpg';
        const cachedImageUrl = await getCachedImageUrl(imageUrl);

        const buttonMessage: any = {
          image: { url: cachedImageUrl },
          caption: nevatxt,
          footer: `Nǐ hǎo, nǐ gānggāng shǐyòngle zhǐlìngq ${prefix + command}`,
          buttons: flowActions,
          headerType: 1,
          viewOnce: true
        };

        await vynnoxbeyours.sendMessage(m.chat, buttonMessage, { quoted: m });
        break;
      }
      case 'cacheinfo': {
        if (!itsOwner) return nevreply("Ngapain Jir Khusus Owmer");
        const cacheInfo = getCacheInfo();
        await vynnoxbeyours.sendMessage(m.chat, {
          text: `📊 *Cache Information*\n\n` +
                `• Total Items: ${cacheInfo.totalItems}\n` +
                `• Total Size: ${cacheInfo.totalSize}\n` +
                `• Cache Duration: 24 hours\n` +
                `• Max Cache Size: ${MAX_CACHE_SIZE} items\n\n` +
                `_Cache Fuhsi Nya Biar Apa yak pikir sendiri dah🗿 cape ketik`
        }, { quoted: m });
        break;
      }
      case 'clearcache': {
        if (!itsOwner) return nevreply("Owner only command");
        const previousSize = imageCache.size;
        imageCache.clear();
        await vynnoxbeyours.sendMessage(m.chat, {
          text: `🗑️ *Cache Hapus*\n\n` +
                `• Previous items: ${previousSize}\n` +
                `• Current items: ${imageCache.size}\n` +
                `_Cache berhasil Di Hapus 😹`
        }, { quoted: m });
        break;
      }

      default:
        break;
    }
  } catch (e) {
    console.error(chalk.redBright("Error:"), e);
  }
};

export default vynnoxbeyours;

const file: string = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  import(`${file}?update=${Date.now()}`);
});