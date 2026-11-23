'use strict';

/**
 * lib/pairing.js — Pure V10 method
 * Dipanggil dari index.js:
 *   await require('./lib/pairing').doPairing(alya, { question });
 */
async function doPairing(alya, { question }) {
    if (!alya.authState.creds.registered) {
        const phoneNumber = await question('Masukin nomor yang mau dijadikan bot.. contoh: 6283166570663\n');
        const pairingalya = "ALYACHAN";
        let code = await alya.requestPairingCode(phoneNumber, pairingalya);
        code = code?.match(/.{1,4}/g)?.join("-") || code;
        console.log(`Ini kodenya:`, code);
    }
}

module.exports = { doPairing };
