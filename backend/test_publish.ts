import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { decryptToken } from './src/utils/crypto';

const prisma = new PrismaClient();

async function publish() {
  const account = await prisma.socialAccount.findFirst({ where: { platform: 'FACEBOOK' }});
  if (!account) return console.log('No FB account');

  const token = decryptToken(account.accessTokenEncrypted);
  console.log('Got token. Attempting to publish to /me/feed...');

  try {
    const res = await axios.post(`https://graph.facebook.com/v19.0/me/feed`, {
      message: 'Just testing the SocialHub API live sync connection! ��',
      access_token: token
    });
    console.log('SUCCESS! Published post ID:', res.data.id);
  } catch (err: any) {
    console.log('ERROR:', err.response?.data || err.message);
  }
}
publish();
