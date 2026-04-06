import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { decryptToken } from './src/utils/crypto';

const prisma = new PrismaClient();

async function testToken() {
  const account = await prisma.socialAccount.findFirst({ where: { platform: 'FACEBOOK' }});
  if (!account) return console.log('No FB account');

  const token = decryptToken(account.accessTokenEncrypted);
  console.log('Got token. Fetching /me/posts with v19.0...');

  try {
    const res = await axios.get(`https://graph.facebook.com/v19.0/me/posts?fields=id,message,full_picture&access_token=${token}`);
    console.log('SUCCESS!', res.data.data.length, 'posts fetched');
    console.log(res.data.data);
  } catch (err: any) {
    console.log('ERROR 1:', err.response?.data || err.message);
  }
}
testToken();
