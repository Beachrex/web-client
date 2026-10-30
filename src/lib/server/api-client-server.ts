/**
 * Side-effect module for server code that calls the generated SDK: the shared client then talks to the API over
 * `serverApiBaseUrl()` (Docker network on the VPS). Import it once at the top of a server module that uses the SDK.
 *
 * It only changes the client instance of the server (RSC) bundle; browser code configures its own instance in
 * `ApiClientProvider` with the public URL, so React Query keys built in the browser keep the public base URL.
 */
import { client } from '@/lib/api-client/client.gen';
import { serverApiBaseUrl } from './api-base';

if (typeof window === 'undefined') {
  const baseUrl = serverApiBaseUrl();
  if (client.getConfig().baseUrl !== baseUrl) client.setConfig({ baseUrl });
}

export {};
