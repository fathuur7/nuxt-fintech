import { IncomingMessage } from 'http';

export default function({ req, redirect }: { req: IncomingMessage; redirect: Function }) {
  const host = req.headers.host;
  
  if (host === 'http://local:3001') {
    // Logic untuk domain 1
  } else if (host === 'http://local:3000') {
    // Logic untuk domain 2
  }
}