#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

// Log dosyası
const logFile = path.join(__dirname, '../logs/rss-daemon.log')

// Log dizinini oluştur
const logDir = path.dirname(logFile)
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

// Log fonksiyonu
function log(message) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}\n`

  console.log(logMessage.trim())
  fs.appendFileSync(logFile, logMessage)
}

// RSS fetcher'ı çalıştır
function runRSSFetcher() {
  log('RSS fetcher başlatılıyor...')

  const rssScript = path.join(__dirname, 'rss-fetcher.js')
  const child = spawn('node', [rssScript, '--schedule'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    detached: false
  })

  // Çıktıları logla
  child.stdout.on('data', (data) => {
    const output = data.toString().trim()
    if (output) {
      log(`[RSS] ${output}`)
    }
  })

  child.stderr.on('data', (data) => {
    const error = data.toString().trim()
    if (error) {
      log(`[RSS ERROR] ${error}`)
    }
  })

  child.on('close', (code) => {
    log(`RSS fetcher kapandı (kod: ${code})`)

    // 30 saniye sonra yeniden başlat
    setTimeout(() => {
      log('RSS fetcher yeniden başlatılıyor...')
      runRSSFetcher()
    }, 30000)
  })

  child.on('error', (error) => {
    log(`RSS fetcher hatası: ${error.message}`)

    // 30 saniye sonra yeniden başlat
    setTimeout(() => {
      log('RSS fetcher yeniden başlatılıyor...')
      runRSSFetcher()
    }, 30000)
  })

  return child
}

// Graceful shutdown
function gracefulShutdown(signal) {
  log(`Sinyal alındı: ${signal}`)
  log('Daemon kapatılıyor...')
  process.exit(0)
}

// Sinyalleri dinle
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'))

// Ana fonksiyon
function main() {
  log('RSS Daemon başlatılıyor...')
  log(`Log dosyası: ${logFile}`)

  // İlk çalıştırma
  runRSSFetcher()

  // Her 6 saatte bir log dosyasını temizle (100MB'dan büyükse)
  setInterval(() => {
    try {
      const stats = fs.statSync(logFile)
      const fileSizeInMB = stats.size / (1024 * 1024)

      if (fileSizeInMB > 100) {
        log('Log dosyası temizleniyor...')
        fs.writeFileSync(logFile, '')
        log('Log dosyası temizlendi')
      }
    } catch (error) {
      log(`Log dosyası kontrol hatası: ${error.message}`)
    }
  }, 6 * 60 * 60 * 1000) // 6 saat
}

// Script çalıştırma
if (require.main === module) {
  main()
}

module.exports = {
  runRSSFetcher,
  log
}
