const nodeMailer = require('nodemailer');

class MailSender {
    constructor() {
        this._transporter = nodeMailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                password: process.env.SMTP_PASSWORD
            }
        })
    }

    sendEmail(targerEmail, content) {
        const message = {
            from: 'Open Music App',
            to: targerEmail,
            subject: 'Ekspor Playlist',
            text: 'Terlampir hasil ekspor playlist Anda',
            attachment: [
                {
                    filename: 'playlist.json',
                    content
                }
            ]
        }

        return this._transporter.sendMail(message)
    }
}

module.exports = MailSender;