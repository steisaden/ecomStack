#!/usr/bin/env node

/**
 * Script to help set up environment variables
 */

console.log(`
===============================
Goddess Hair & Beauty - Environment Setup
===============================

To set up your environment variables:

1. Contentful Setup:
   - Go to https://app.contentful.com/
   - Create a new space or use an existing one
   - Go to Settings > General Settings to get your Space ID
   - Go to Settings > API keys to get or create:
     * Content Delivery API - access token
     * Content Preview API - access token
   - Go to Settings > API keys > Content management tokens to create a management token

2. Auth Token:
   - Generate a secure random string for admin authentication
   - You can use: openssl rand -base64 32

3. JWT Secret:
   - Generate a secure random string for JWT signing
   - You can use: openssl rand -base64 32

4. Update your .env file with these values:
   - Open .env file in your project root
   - Fill in each variable with your actual values

Example .env file structure:
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_cda_token
CONTENTFUL_MANAGEMENT_TOKEN=your_cma_token
AUTH_TOKEN=your_auth_token
JWT_SECRET=your_jwt_secret

After filling in your values, you can run:
npm run contentful:create-types

This will create all the necessary content types in your Contentful space.
`);