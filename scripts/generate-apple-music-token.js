// File: scripts/generate-apple-music-token.js
// Run this script with Node.js to generate your Apple Music Developer Token

const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Your Apple Music credentials from .env
const TEAM_ID = '2W84KL24RW';
const KEY_ID = '897LQ9U6VR';

// Path to your .p8 private key file
// You need to download this from Apple Developer Portal and place it in your project
const PRIVATE_KEY_PATH = './AuthKey_897LQ9U6VR.p8'; // Update this path

function generateAppleMusicToken() {
  try {
    // Check if private key file exists
    if (!fs.existsSync(PRIVATE_KEY_PATH)) {
      console.error('❌ Private key file not found at:', PRIVATE_KEY_PATH);
      console.log('\n📋 To get your private key file:');
      console.log('1. Go to https://developer.apple.com/account/resources/authkeys/list');
      console.log('2. Find your key with ID: 897LQ9U6VR');
      console.log('3. Download the AuthKey_897LQ9U6VR.p8 file');
      console.log('4. Place it in your project root directory');
      console.log('5. Run this script again');
      return;
    }

    // Read the private key
    const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
    
    // Generate JWT token
    const token = jwt.sign(
      {}, // Empty payload
      privateKey,
      {
        algorithm: 'ES256',
        expiresIn: '180d', // 6 months
        issuer: TEAM_ID,
        header: {
          alg: 'ES256',
          kid: KEY_ID
        }
      }
    );

    console.log('✅ Apple Music Developer Token generated successfully!');
    console.log('\n🔑 Your Developer Token:');
    console.log(token);
    console.log('\n📝 Add this to your .env file:');
    console.log(`EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN=${token}`);
    console.log('\n⏰ Token expires in 180 days');
    
    // Optionally save to file
    const envLine = `EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN=${token}`;
    fs.writeFileSync('.env.apple-music', envLine);
    console.log('\n💾 Token also saved to .env.apple-music file');

  } catch (error) {
    console.error('❌ Error generating token:', error.message);
    
    if (error.message.includes('invalid key')) {
      console.log('\n🔧 Troubleshooting:');
      console.log('- Make sure the .p8 file is valid');
      console.log('- Verify the Key ID matches your file');
      console.log('- Check that the file hasn\'t been corrupted');
    }
  }
}

// Install required dependency
console.log('🚀 Generating Apple Music Developer Token...\n');
console.log('📦 Make sure you have jsonwebtoken installed:');
console.log('npm install jsonwebtoken\n');

generateAppleMusicToken();