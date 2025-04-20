import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendEmail(options: { to: string; subject: string; text: string }) {
    await this.transporter.sendMail({
      from: '"Your App" <youremail@gmail.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
    });
  }
}
