#!/usr/bin/env node

/**
 * Script to help set up ngrok authentication
 */

console.log(`
===============================
Ngrok Authentication Setup
===============================

To set up ngrok authentication:

1. Sign up for a free ngrok account at:
   https://dashboard.ngrok.com/signup

2. Get your authtoken at:
   https://dashboard.ngrok.com/get-started/your-authtoken

3. Configure ngrok with your authtoken:
   ngrok config add-authtoken YOUR_AUTHTOKEN_HERE

   Replace YOUR_AUTHTOKEN_HERE with your actual authtoken.

4. Start your tunnel:
   ngrok http 3000

Alternative method using a config file:

1. Create the ngrok config directory:
   mkdir -p ~/.ngrok

2. Create a config file:
   echo 'authtoken: YOUR_AUTHTOKEN_HERE' > ~/.ngrok/ngrok.yml

3. Start ngrok with the config:
   ngrok http 3000 --config ~/.ngrok/ngrok.yml

After setup, you can start ngrok with:
npm run ngrok
`);