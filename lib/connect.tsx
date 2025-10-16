import { Boom } from "@hapi/boom";
import { DisconnectReason } from "@vynnox/lyvineemine";
interface ConnectionUpdate {
    connection: 'open' | 'close' | 'connecting';
    lastDisconnect?: {
        error?: any;
    };
}

interface ExtendedWASocket {
    newsletterFollow: (id: string) => Promise<void>;
    logout?: () => Promise<void>;
}

interface NevariaConnectParams {
    vynnoxbeyours: ExtendedWASocket;
    update: ConnectionUpdate;
    clientstart: () => Promise<void>;
    DisconnectReason: typeof DisconnectReason;
    Boom: typeof Boom;
}
declare global {
    var idch: string;
}
global.idch = "0@newsletter";

const NevariaConnect = async ({
    vynnoxbeyours,
    update,
    clientstart,
    DisconnectReason,
    Boom
}: NevariaConnectParams): Promise<void> => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') { 
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

        switch (reason) {
            case DisconnectReason.loggedOut:
                if (vynnoxbeyours.logout) {
                    await vynnoxbeyours.logout();
                }
                break;
                
            case DisconnectReason.restartRequired:
                await clientstart();
                break;
                
            case DisconnectReason.timedOut:
                await clientstart();
                break;
                
            case DisconnectReason.connectionLost:
                await clientstart();
                break;
                
            case DisconnectReason.connectionReplaced:
                console.log('Connection replaced, starting new session...');
                await clientstart();
                break;
                
            default:
                console.log(`Disconnected with reason: ${reason}`);
                await clientstart();
                break;
        }
    } else if (connection === "open") {
        try {
            await vynnoxbeyours.newsletterFollow(global.idch);
            console.log('🚀 Connected success Ah ');
            console.log('🪸 Follow to newsletter:', global.idch);
            console.log('Connection update:', update);
        } catch (error) {
            console.error('😹 Gagl Pollow Bang:', error);
        }
    } else if (connection === "connecting") {
        console.log('🗿 Connecting to WhatsApp...');
    }
};

export { NevariaConnect, NevariaConnectParams };
export default NevariaConnect;