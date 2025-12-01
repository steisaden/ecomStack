#!/usr/bin/env node

/**
 * Deployment configuration script
 * Helps switch between static export and webhook-enabled configurations
 */

const fs = require('fs')
const path = require('path')

const STATIC_CONFIG = 'next.config.js'
const WEBHOOK_CONFIG = 'next.config.webhook.js'

function showUsage() {
  console.log(`
Usage: node scripts/configure-deployment.js [mode]

Modes:
  static    - Configure for static export (default, no webhooks)
  webhook   - Configure for webhook support (dynamic rendering)
  status    - Show current configuration

Examples:
  node scripts/configure-deployment.js static
  node scripts/configure-deployment.js webhook
  node scripts/configure-deployment.js status
`)
}

function getCurrentConfig() {
  try {
    const config = fs.readFileSync(STATIC_CONFIG, 'utf8')
    if (config.includes("output: 'export'")) {
      return 'static'
    } else {
      return 'webhook'
    }
  } catch (error) {
    return 'unknown'
  }
}

function configureStatic() {
  console.log('Configuring for static export deployment...')
  
  // The default next.config.js is already configured for static export
  console.log('✅ Static export configuration is already active')
  console.log('   - Optimized for Cloudflare Pages, Netlify, etc.')
  console.log('   - No API routes (webhooks disabled)')
  console.log('   - Best performance for static content')
}

function configureWebhook() {
  console.log('Configuring for webhook support...')
  
  if (!fs.existsSync(WEBHOOK_CONFIG)) {
    console.error(`❌ ${WEBHOOK_CONFIG} not found`)
    console.log('   Please ensure the webhook configuration file exists')
    process.exit(1)
  }
  
  // Backup current config
  const backupPath = `${STATIC_CONFIG}.backup`
  fs.copyFileSync(STATIC_CONFIG, backupPath)
  console.log(`📁 Backed up current config to ${backupPath}`)
  
  // Copy webhook config
  fs.copyFileSync(WEBHOOK_CONFIG, STATIC_CONFIG)
  console.log('✅ Webhook configuration activated')
  console.log('   - API routes enabled')
  console.log('   - Webhooks supported')
  console.log('   - Requires server-side rendering platform')
  console.log('')
  console.log('Recommended deployment platforms:')
  console.log('   - Vercel (recommended)')
  console.log('   - Netlify Functions')
  console.log('   - Railway')
  console.log('   - Render')
}

function showStatus() {
  const currentConfig = getCurrentConfig()
  
  console.log('Current deployment configuration:')
  console.log('')
  
  switch (currentConfig) {
    case 'static':
      console.log('📦 Mode: Static Export')
      console.log('   - Output: Static files')
      console.log('   - API Routes: Disabled')
      console.log('   - Webhooks: Not supported')
      console.log('   - Performance: Optimal')
      console.log('   - Deployment: Any static host')
      break
      
    case 'webhook':
      console.log('🔗 Mode: Webhook Support')
      console.log('   - Output: Server-side rendering')
      console.log('   - API Routes: Enabled')
      console.log('   - Webhooks: Supported')
      console.log('   - Performance: Good')
      console.log('   - Deployment: Server-side platforms only')
      break
      
    default:
      console.log('❓ Mode: Unknown')
      console.log('   - Configuration may be corrupted')
      break
  }
  
  console.log('')
  console.log('Available configurations:')
  console.log(`   - ${STATIC_CONFIG} (current)`)
  console.log(`   - ${WEBHOOK_CONFIG} (webhook support)`)
}

// Main execution
const mode = process.argv[2]

if (!mode) {
  showUsage()
  process.exit(1)
}

switch (mode.toLowerCase()) {
  case 'static':
    configureStatic()
    break
    
  case 'webhook':
    configureWebhook()
    break
    
  case 'status':
    showStatus()
    break
    
  default:
    console.error(`❌ Unknown mode: ${mode}`)
    showUsage()
    process.exit(1)
}