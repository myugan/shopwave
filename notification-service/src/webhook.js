const logger = require('./logger')

const metrics = {
  succeeded: 0,
  failed: 0,
}

function handleWorkflowComplete(req, res) {
  const body = req.body || {}
  const metadata = body.metadata || {}
  const status = body.status || {}

  const workflowName = metadata.name || 'unknown'
  const labels = metadata.labels || {}
  const orderId = labels['order-id'] || labels.order_id || null
  const phase = status.phase || 'Unknown'

  logger.info('Workflow webhook received', {
    workflow: workflowName,
    order_id: orderId,
    phase,
  })

  if (phase === 'Succeeded') {
    metrics.succeeded += 1
    logger.info(`Invoice email sent for order ${orderId || workflowName}`)
  } else if (phase === 'Failed') {
    metrics.failed += 1
    logger.warn(`Workflow failed for order ${orderId || workflowName}`)
  }

  res.status(200).json({
    received: true,
    order_id: orderId,
    phase,
  })
}

function getMetrics() {
  return metrics
}

module.exports = { handleWorkflowComplete, getMetrics }
