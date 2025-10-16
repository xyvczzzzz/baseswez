import {
    extractMessageContent,
    jidNormalizedUser,
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
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Store {
    loadMessage(chatId: string, messageId: string, client: any): Promise<any>;
}

export const smsg = (vynnoxbeyours: any, m: any, store: Store): any => {
    if (!m) return m

    if (m.key) {
        m.id = m.key.id
        m.from = m.key.remoteJid.startsWith('status') ? jidNormalizedUser(m.key?.participant || m.participant) : jidNormalizedUser(m.key.remoteJid);
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat.endsWith('@g.us')
        m.sender = vynnoxbeyours.decodeJid ? vynnoxbeyours.decodeJid(m.fromMe && vynnoxbeyours.user?.id || m.participant || m.key.participant || m.chat || '') : ''
        if (m.isGroup) m.participant = vynnoxbeyours.decodeJid ? vynnoxbeyours.decodeJid(m.key.participant) || '' : ''
    }
    if (m.message) {
        m.mtype = getContentType(m.message)
        m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype])
        m.body = m.message.conversation || m.msg.caption || m.msg.text || (m.mtype == 'listResponseMessage') && m.msg.singleSelectReply.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.msg.selectedButtonId || (m.mtype == 'viewOnceMessage') && m.msg.caption || m.text
        let quoted = m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null
        m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
        if (m.quoted) {
            let type = getContentType(quoted)
			m.quoted = m.quoted[type]
            if (['productMessage'].includes(type)) {
				type = getContentType(m.quoted)
				m.quoted = m.quoted[type]
			}
            if (typeof m.quoted === 'string') m.quoted = {
				text: m.quoted
			}
 
			m.quoted.key = {
				remoteJid: m.msg?.contextInfo?.remoteJid || m.from,
				participant: jidNormalizedUser(m.msg?.contextInfo?.participant),
				fromMe: areJidsSameUser(jidNormalizedUser(m.msg?.contextInfo?.participant), jidNormalizedUser(vynnoxbeyours?.user?.id)),
				id: m.msg?.contextInfo?.stanzaId,
			};
            
            m.quoted.mtype = type
            m.quoted.from = /g\.us|status/.test(m.msg?.contextInfo?.remoteJid) ? m.quoted.key.participant : m.quoted.key.remoteJid;
            m.quoted.id = m.msg.contextInfo.stanzaId
			m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
            m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false
			m.quoted.sender = vynnoxbeyours.decodeJid ? vynnoxbeyours.decodeJid(m.msg.contextInfo.participant) : ''
			m.quoted.fromMe = m.quoted.sender === (vynnoxbeyours.user && vynnoxbeyours.user.id)
            m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
			m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
            
            m.getQuotedObj = m.getQuotedMessage = async () => {
			    if (!m.quoted.id) return false
			    let q = await store.loadMessage(m.chat, m.quoted.id, vynnoxbeyours)
 			    return exports.smsg(vynnoxbeyours, q, store)
            }

            m.quoted.delete = () => vynnoxbeyours.sendMessage ? vynnoxbeyours.sendMessage(m.quoted.chat, { delete: m.quoted.key }) : Promise.resolve()

            m.quoted.copyNForward = (jid: string, forceForward = false, options = {}) => vynnoxbeyours.copyNForward ? vynnoxbeyours.copyNForward(jid, m.quoted, forceForward, options) : Promise.resolve()

            m.quoted.download = () => vynnoxbeyours.downloadMediaMessage ? vynnoxbeyours.downloadMediaMessage(m.quoted) : Promise.resolve(Buffer.from(''))
        }
    }
    
    if (m.msg && m.msg.url) {
        m.download = () => vynnoxbeyours.downloadMediaMessage ? vynnoxbeyours.downloadMediaMessage(m.msg) : Promise.resolve(Buffer.from(''))
    }
    
    m.text = m.msg && m.msg.text || m.msg && m.msg.caption || m.message && m.message.conversation || m.msg && m.msg.contentText || m.msg && m.msg.selectedDisplayText || m.msg && m.msg.title || ''
    
    m.reply = (text: string | Buffer, chatId: string = m.chat, options = {}) => {
        if (Buffer.isBuffer(text)) {
            return vynnoxbeyours.sendMedia ? vynnoxbeyours.sendMedia(chatId, text, 'file', '', m, { ...options }) : Promise.resolve()
        } else {
            return vynnoxbeyours.sendText ? vynnoxbeyours.sendText(chatId, text, m, { ...options }) : Promise.resolve()
        }
    }
    
	m.copy = () => exports.smsg(vynnoxbeyours, JSON.parse(JSON.stringify(m)), store)

	m.copyNForward = (jid: string = m.chat, forceForward = false, options = {}) => vynnoxbeyours.copyNForward ? vynnoxbeyours.copyNForward(jid, m, forceForward, options) : Promise.resolve()

    return m
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${__filename}`))
	delete require.cache[file]
	require(file)
})

export default smsg