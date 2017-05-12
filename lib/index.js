const TelegramBot = require('node-telegram-bot-api')
const moment = require('moment')
const _ = require('lodash')
const YAML = require('yamljs')
const path = require('path')

moment.locale('ru')
moment.suppressDeprecationWarnings = true

const config = YAML.load(path.resolve(__dirname, '../data/date-table.yaml'))

const token = '385957590:AAH36FC2zBf1Z8XuwH24zZ1RHFJJhGWrZ8Y'

const bot = new TelegramBot(token, { polling: true })

const dateMasks = [
  'DD.MM.YYYY h:mm:ss',
  null
]

const momentDate = (dateStr) =>
  _(dateMasks)
    .map((mask) => moment(dateStr, mask))
    .filter((date) => date.isValid())
    .first()

const dateTable = _.map(config.data, (item) => _.extend(item, {
  date: momentDate(item.date)
}))

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  const date = momentDate(msg.text)

  if (date) {
  	bot.sendMessage(chatId, `Принята дата: ${date.format('LLLL')}`)

    const tableItem = _(dateTable)
      .filter((item) => item.date.isBefore(date))
      .last()

    if (tableItem) {
      const template = 
`Приняты изменения от ${tableItem.date.format('LL')}
Смещение для Москвы: +${_.padStart(tableItem.msk, 2, '0')}
Смещение для Ижевска: +${_.padStart(tableItem.izh, 2, '0')}`

      bot.sendMessage(chatId, template)
    }
  } else {
  	bot.sendMessage(chatId, `Не могу распознать дату в тексте: ${msg.text}`)
  }

});
