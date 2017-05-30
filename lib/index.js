const TelegramBot = require('node-telegram-bot-api')
const moment = require('moment')
const _ = require('lodash')
const path = require('path')

const config = require('config')
const express = require('express')
const rp = require('request-promise-native')

const app = express()

app.get('/', function(req, res){
  res.send('bot is active')
});

app.listen(process.env.PORT || 4000);

moment.locale('ru')
moment.suppressDeprecationWarnings = true

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

const responseTransform = (out) => {
  return _.map(out, (item) => _.extend({}, item, {
    date: moment(item.date)
  })).sort((a, b) => a.date.isBefore(b.date) ? -1 : 1)
}

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  const date = momentDate(msg.text)

  console.log('MSG', msg)

  if (date) {
  	bot.sendMessage(chatId, `Принята дата: ${date.format('LLLL')}`)

    const url = config.get('db.dates')
    
    rp.get({
      method: 'GET',
      uri: url,
      json: true,
      transform: responseTransform
    })
      .then((dateTable) => {
        //console.log('OUT', out)
        //bot.sendMessage(chatId, JSON.stringify(data, null, '\t'))
        const tableItem = _(dateTable)
          .filter((item) => item.date.isBefore(date))
          .last()

        if (tableItem) {
          const template = 
`Приняты изменения от ${tableItem.date.format('LL')}
Смещение для Москвы: +${tableItem.offset}`

          bot.sendMessage(chatId, template)
        }
      })

  } else {
  	bot.sendMessage(chatId, `Не могу распознать дату в тексте: ${msg.text}`)
  }

});
