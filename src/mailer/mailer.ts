import Email from 'email-templates'
import nodemailer, { Transporter } from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { joinRelativeToMainPath } from '@/utils/paths'

export abstract class Mailer {
  private transporter: Transporter<SMTPTransport.SentMessageInfo>

  protected mailer: Email

  constructor() {
    this.createTransporter()

    this.initializeMailer()
  }

  private initializeMailer() {
    this.mailer = new Email({
      views: {
        root: joinRelativeToMainPath(process.env.MAIL_TPL_PATH),
        options: { extension: 'ejs' }
      },
      preview: false,
      send: true,
      transport: this.transporter
    })
  }

  private createTransporter() {
    const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD } = process.env

    if (!MAIL_HOST || !MAIL_PORT || !MAIL_USER || !MAIL_PASSWORD) {
      throw new Error('Missing required mail environment variables.')
    }

    this.transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: Number(MAIL_PORT),
      secure: true,
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASSWORD
      },
      debug: true,
      logger: true
    })
  }
}
