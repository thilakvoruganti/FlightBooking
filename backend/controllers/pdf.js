const path = require('path')
const pdfTemplate = require('../documents')

let pdf = null
try {
    pdf = require('html-pdf')
} catch (error) {
    pdf = null
}

const createPdf = (req, res) => {
    if (!pdf) {
        return res.status(503).json({
            success: false,
            message: 'PDF service unavailable: html-pdf is not installed on server',
        })
    }

    const bookingid = String(req.body?.bookingid || 'booking').replace(/[^a-zA-Z0-9-_]/g, '')
    const fileName = `ticket-${bookingid}.pdf`
    const outputPath = path.join(__dirname, '..', fileName)

    pdf.create(pdfTemplate(req.body), {
        format: 'A4',
        border: {
            top: '12mm',
            right: '10mm',
            bottom: '12mm',
            left: '10mm',
        },
    }).toFile(outputPath, (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Unable to create PDF' })
        }
        return res.status(200).json({ success: true, fileName })
    })
}

const getPdf = (req, res) => {
    const safeFileName = String(req.query?.file || '').replace(/[^a-zA-Z0-9-_.]/g, '')
    const fileName = safeFileName || 'ticket-booking.pdf'
    const filePath = path.join(__dirname, '..', fileName)
    return res.download(filePath, fileName, (error) => {
        if (error && !res.headersSent) {
            res.status(404).json({ success: false, message: 'PDF not found' })
        }
    })
}

module.exports = { createPdf, getPdf }
