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
  const child = spawn('node', [rssScript, '--fetch'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    detached: false
  })

  let hasOutput = false

  // Çıktıları logla
  child.stdout.on('data', (data) => {
    const output = data.toString().trim()
    if (output) {
      hasOutput = true
      log(`[RSS] ${output}`)
    }
  })

  child.stderr.on('data', (data) => {
    const error = data.toString().trim()
    if (error && !error.includes('Link bulunamadı') && !error.includes('Haber zaten mevcut')) {
      log(`[RSS ERROR] ${error}`)
    }
  })

  child.on('close', (code) => {
    if (code !== 0) {
      log(`RSS fetcher hata ile kapandı (kod: ${code})`)
    } else {
      log('RSS fetcher başarıyla tamamlandı')

      // En son stats dosyasını bul ve logla
      try {
        const statsDir = path.join(__dirname, '../logs/daemon')
        if (fs.existsSync(statsDir)) {
          const files = fs.readdirSync(statsDir)
            .filter(file => file.endsWith('-stats.json'))
            .sort()
            .reverse()

          if (files.length > 0) {
            const latestStatsFile = path.join(statsDir, files[0])
            const stats = JSON.parse(fs.readFileSync(latestStatsFile, 'utf8'))

            log(`📊 RSS İstatistikleri: ${stats.summary.totalNewNews} yeni haber, ${stats.summary.successRate}% başarı oranı, ${stats.duration.seconds}s sürdü`)

            if (stats.newNews.length > 0) {
              log(`📰 Yeni haberler: ${stats.newNews.slice(0, 3).map(n => n.title).join(', ')}${stats.newNews.length > 3 ? '...' : ''}`)
            }
          }
        }
      } catch (error) {
        log(`Stats dosyası okuma hatası: ${error.message}`)
      }
    }
  })

  child.on('error', (error) => {
    log(`RSS fetcher çalıştırma hatası: ${error.message}`)
  })

  return child
}

// Ana daemon döngüsü
function startDaemon() {
  log('RSS Daemon V2 başlatılıyor...')
  log(`Log dosyası: ${logFile}`)

  // İlk çalıştırma
  runRSSFetcher()

  // Her 10 dakikada bir çalıştır
  const interval = setInterval(() => {
    log('Zamanlanmış RSS çekme başlatılıyor...')
    runRSSFetcher()
  }, 10 * 60 * 1000) // 10 dakika

  // Log temizleme (her 6 saatte bir)
  const logCleanupInterval = setInterval(() => {
    try {
      const stats = fs.statSync(logFile)
      const fileSizeInMB = stats.size / (1024 * 1024)

      if (fileSizeInMB > 50) { // 50MB'dan büyükse temizle
        log('Log dosyası temizleniyor...')
        fs.writeFileSync(logFile, '')
        log('Log dosyası temizlendi')
      }
    } catch (error) {
      log(`Log dosyası kontrol hatası: ${error.message}`)
    }
  }, 6 * 60 * 60 * 1000) // 6 saat

  // Graceful shutdown
  function gracefulShutdown(signal) {
    log(`Sinyal alındı: ${signal}`)
    log('Daemon kapatılıyor...')

    clearInterval(interval)
    clearInterval(logCleanupInterval)

    process.exit(0)
  }

  // Sinyalleri dinle
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
  process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'))
}

// Script çalıştırma
if (require.main === module) {
  startDaemon()
}

module.exports = {
  runRSSFetcher,
  log,
  startDaemon
}
