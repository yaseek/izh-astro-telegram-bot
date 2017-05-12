const TelegramBot = require('node-telegram-bot-api')
const moment = require('moment')

moment.locale('ru')

const token = '385957590:AAH36FC2zBf1Z8XuwH24zZ1RHFJJhGWrZ8Y'

const bot = new TelegramBot(token, { polling: true })

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  console.log('MSG', msg)

  const date = moment(msg.text)

  if (date.isValid()) {
  	bot.sendMessage(chatId, `Received your message: ${date.format('LLLL')}`)
  } else {
  	bot.sendMessage(chatId, `Received your wrong message: ${msg.text}`)
  }


  /*new Promise((resolve, reject) => {
	const date = moment(msg.text)
	return date.isValid() ? resolve(date) : reject()
  })
  	.then((date) => bot.sendMessage(chatId, `Received your message: ${date.format('LLLL')}`))
  	.catch(() => bot.sendMessage(chatId, `Received your wrong message: ${msg.text}`))
  	*/

});
