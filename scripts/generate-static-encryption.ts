// scripts/generate-static-encryption.ts
import { EYE_TRACKING_CONSTANTS } from '@/constants/eye-tracking';
import { encryptConstants, simpleEncrypt } from '@/utils/encryption';
import fs from 'fs';
import path from 'path';

const generateStaticEncryption = () => {
	console.log('🔐 Generating static encrypted constants...\n');

	// Method 1: AES Encryption
	try {
		const encryptedAES = encryptConstants(EYE_TRACKING_CONSTANTS);
		console.log('AES Encrypted:');
		console.log(encryptedAES);
		console.log('\n' + '='.repeat(50) + '\n');
	} catch (error) {
		console.log('AES Encryption failed, trying simple method...');
	}

	// Method 2: Simple Base64 (always works)
	const encryptedSimple = simpleEncrypt(EYE_TRACKING_CONSTANTS);
	console.log('Base64 Encoded:');
	console.log(encryptedSimple);
	console.log('\n' + '='.repeat(50) + '\n');

	// Save to file for easy copy-paste
	const output = {
		aes: encryptConstants(EYE_TRACKING_CONSTANTS),
		base64: simpleEncrypt(EYE_TRACKING_CONSTANTS),
		timestamp: new Date().toISOString(),
	};

	fs.writeFileSync(
		path.join(process.cwd(), 'encrypted-constants.json'),
		JSON.stringify(output, null, 2)
	);

	console.log('✅ Encrypted constants saved to encrypted-constants.json');
};

generateStaticEncryption();
