import crypto from 'crypto';
import type { SessionUser } from '@/lib/auth';
function secret(){const value=process.env.AUTH_SECRET;if(!value||value.length<32)throw new Error('AUTH_SECRET must contain at least 32 characters');return value}
function sign(payload:string){return crypto.createHmac('sha256',secret()).update(payload).digest('base64url')}
export function sessionDigest(value:string){return crypto.createHash('sha256').update(value).digest('hex')}
export function encodeSession(user:SessionUser){const payload=Buffer.from(JSON.stringify({...user,iat:Date.now(),exp:Date.now()+8*60*60*1000}),'utf8').toString('base64url');return`${payload}.${sign(payload)}`}
export function decodeSession(value?:string|null):SessionUser|null{if(!value)return null;try{const[payload,signature]=value.split('.');if(!payload||!signature)return null;const a=Buffer.from(sign(payload)),b=Buffer.from(signature);if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return null;const user=JSON.parse(Buffer.from(payload,'base64url').toString('utf8')) as SessionUser&{exp?:number};if(!user.email||!user.tenantId||!['admin','manager','analyst'].includes(user.role)||typeof user.exp!=='number'||user.exp<=Date.now())return null;return user}catch{return null}}
