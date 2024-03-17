import nodemailer from 'nodemailer';

class MailService {
  private transporter = nodemailer.createTransport({
    service: 'yandex',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  sendMail = async (to: string, subject: string, html: string) => {
    return await this.transporter.sendMail({
      from: '"Stud.log" <studlog.help@yandex.ru>',
      to: to,
      subject: `Stud.log - ${subject}`,
      html,
    });
  };
}

export default new MailService();
