import { WASocket } from "@vynnox/lyvineemine";
interface HandlerParams {
    vynnoxbeyours: ExtendedWASocket;
    text?: string;
    nevreply: (text: string) => Promise<void>;
}

interface ExtendedWASocket extends WASocket {
    sendStatusMention: (content: any, recipients: string[]) => Promise<any>;
}

interface ExtendedMessage {
    quoted?: {
        mtype?: string;
        text?: string;
        download?: () => Promise<Buffer>;
    };
    mtype?: string;
    chat?: string;
}

const handler = async (m: ExtendedMessage, { vynnoxbeyours, text, nevreply }: HandlerParams): Promise<void> => {
    const quoted = m.quoted ? m.quoted : null;

    if (!quoted && text) {
        await vynnoxbeyours.sendStatusMention(
            { text: text },
            [m.chat!]
        );
        return;
    }

    if (quoted && quoted.mtype === "conversation") {
        await vynnoxbeyours.sendStatusMention(
            { text: quoted.text || '' },
            [m.chat!]
        );
        return;
    }

    if (quoted && quoted.mtype === "audioMessage") {
        let audioData = await quoted.download!();
        await vynnoxbeyours.sendStatusMention(
            { audio: audioData, mimetype: 'audio/mp4', ptt: true },
            [m.chat!]
        );
    }

    if (quoted && quoted.mtype === "imageMessage") {
        let imageData = await quoted.download!();
        await vynnoxbeyours.sendStatusMention(
            { image: imageData, caption: text || '' },
            [m.chat!]
        );
    }

    if (quoted && quoted.mtype === "videoMessage") {
        let videoData = await quoted.download!();
        await vynnoxbeyours.sendStatusMention(
            { video: videoData, caption: text || '' },
            [m.chat!]
        );
    }
};

handler.help = ['upsw'];
handler.tags = ['owner'];
handler.command = ['upsw'];
handler.owner = true;

export default handler;