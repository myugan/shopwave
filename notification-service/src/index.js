const express = require('express')
const logger = require('./logger')
const { handleWorkflowComplete, getMetrics } = require('./webhook')

const PORT = parseInt(process.env.PORT || '3000', 10)
const app = express()

app.use(express.json())

app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    logger.info('HTTP request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration_ms: Date.now() - start,
    })
  })
  next()
})

app.post('/webhook/workflow-complete', handleWorkflowComplete)

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'notification-service',
    version: '1.0.0',
  })
})

app.get('/metrics', (req, res) => {
  const m = getMetrics()
  const lines = [
    '# HELP notifications_total Total workflow notifications',
    '# TYPE notifications_total counter',
    `notifications_total{status="succeeded"} ${m.succeeded}`,
    `notifications_total{status="failed"} ${m.failed}`,
  ]
  res.type('text/plain').send(lines.join('\n') + '\n')
})

const server = app.listen(PORT, () => {
  logger.info(`Notification service listening on port ${PORT}`)
})

function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully`)
  server.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })
  setTimeout(() => process.exit(1), 10000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
