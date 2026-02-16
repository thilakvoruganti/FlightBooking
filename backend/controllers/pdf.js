const fs = require('fs')
const path = require('path')
const pdf = require('html-pdf')
const pdfTemplate = require('../documents')

const createPdf = (req, res) => {
    const bookingid = String(req.body?.bookingid || 'booking').replace(/[^a-zA-Z0-9-_]/g, '')
    const fileName = `ticket-${bookingid}.pdf`
    const outputPath = path.join(__dirname, '..', fileName)
    const wantsJsonResponse = req.headers.accept?.includes('application/json')

    pdf.create(pdfTemplate(req.body), {
        format: 'A4',
        border: {
            top: '12mm',
            right: '10mm',
            bottom: '12mm',
            left: '10mm',
        },
    }).toBuffer((err, buffer) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Unable to create PDF' })
        }

        fs.writeFile(outputPath, buffer, () => {})

        if (wantsJsonResponse) {
            return res.status(200).json({ success: true, fileName })
        }

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
        return res.status(200).send(buffer)
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
