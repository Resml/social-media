import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { decryptToken } from './src/utils/crypto';

const prisma = new PrismaClient();

async function run() {
  const account = await prisma.socialAccount.findFirst({ where: { platform: 'FACEBOOK' }});
  if (!account) return console.log('No FB account');
  console.log('Found account:', account.id);
  try {
    const token = decryptToken(account.accessTokenEncrypted);
    console.log('Decrypted Token length:', token.length);
    const res = await axios.get(`https://graph.facebook.com/v19.0/me/posts?fields=id,message,full_picture,created_time&access_token=${token}`);
    console.log('Response:', JSON.stringify(res.data, null, 2));
  } catch (e: any) {
    console.error('Error:', e.response?.data || e.message);
  }
}
run();
