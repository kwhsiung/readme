const { camelizeKeys } = require('humps')
const { handlerError } = require('../comm')
const { get, map, remove } = require('lodash')
const { trace } = require('./gcLogger/comm')
const config = require('../config')
const debug = require('debug')('README:api:poll')
const express = require('express')
const numeral = require('numeral')
const router = express.Router()
const superagent = require('superagent')

const apiHost = config.API_PROTOCOL + '://' + config.API_HOST + ':' + config.API_PORT
const postOpts = (url, opts, req) => new Promise(resolve => {
  superagent
  .post(url)
  .send({
    choices: opts
  })
  .end((error, response) => {
    if (error) {
      console.error(`Error occurred during gen options: ${url}`)
      console.error(error) 
    }
    trace({
      ip: req.clientIp,
      method: 'POST',
      model: 'choices',
      payload: choices,
      operator: req.user.id,
      response,
    })
    resolve()
  })  
})
const putOpts = (url, opts, margin, req) => new Promise(resolve => {
  const choices = map(opts, opt => Object.assign({}, opt))
  if (margin > -1) {
    map(choices, c => {
      c.group_order = c.group_order + margin
    })    
  }
  superagent
  .put(url)
  .send({
    choices: choices
  })
  .end((error, response) => {
    if (error) {
      console.error(`Error occurred during put options: ${url}`)
      console.error(error) 
    }
    trace({
      ip: req.clientIp,
      method: 'PUT',
      model: 'choices',
      payload: choices,
      operator: req.user.id,
      response,
    })
    resolve()
  })  
})
const updateOptions = (req, res) => {
  const choices = get(req, 'body.choices', [])
  const id = get(req, 'body.id')
  
  if (!id) {
    console.error('Missing poll id. Opts len:', options.length)
    res.send({ status: 200, text: 'Creating/Updating a poll successfully but options got problems.' })
  } else {

    const url = `${apiHost}/v2/polls/${id}/choices`
  
    map(choices, (opt, index) => {
      opt.active = !opt.created_by ? 1 : opt.active
      opt.created_by = !opt.created_by && req.user.id
      opt.updated_by = req.user.id
      opt.group_order = index
    })

    const oldOpts = remove(choices, opt => opt.id)    
    putOpts(url, oldOpts, oldOpts.length + choices.length, req)
    .then(() => Promise.all([
      putOpts(url, oldOpts, undefined, req),
      postOpts(url, choices, req)
    ]))
    .then(() => {
      res.send({ status: 200, text: 'Creating/Updating a poll successfully.' })
    }).catch(err => {
      const errWrapped = handlerError(err)
      res.status(errWrapped.status).send({
        status: errWrapped.status,
        text: errWrapped.text
      })
      console.error(`Error occurred during updating options of poll.id ${id}`)
      console.error(err)     
    })
  }
}

router.use('/list', (req, res) => {
  const url = `${apiHost}/v2/polls`
  debug('Got a /polls call:')
  debug(req.url)
  
  superagent
  .get(url)
  .end((error, response) => {
    if (!error && response) {
      debug('Fetch polls from api successfully.')
      res.send(camelizeKeys(response.body))
    } else {
      const errWrapped = handlerError(error, response)
      res.status(errWrapped.status).send({
        status: errWrapped.status,
        text: errWrapped.text
      })
      console.error(`Error occurred during fetch data from : ${url}`)
      console.error(error) 
    }
  })
})
router.use(`/:id/choices`, (req, res) => {
  const id = req.params.id
  const url = `${apiHost}/v2/polls/${id}/choices`
  debug('Got a /polls/${id}/choices call:')
  debug(req.url)
  
  superagent
  .get(url)
  .end((error, response) => {
    if (!error && response) {
      debug('Fetch polls from api successfully.')
      res.send(camelizeKeys(response.body))
    } else {
      const errWrapped = handlerError(error, response)
      res.status(errWrapped.status).send({
        status: errWrapped.status,
        text: errWrapped.text
      })
      console.error(`Error occurred during fetch data from : ${url}`)
      console.error(error) 
    }
  })
})
router.post('/create', (req, res, next) => {
  debug('Got a post creating call.')
  // res.send('ok')
  const url = `${apiHost}/v2/polls`
  // const options = get(req, 'body.options', [])
  req.body.created_by = {
    id: req.user.id
  }
  req.body.updated_by = req.user.id
  debug(req.body)

  const choices = get(req, 'body.choices', [])
  map(choices, (opt, index) => {
    opt.created_by = req.user.id
    opt.updated_by = req.user.id
    opt.active = 1
    opt.group_order = index
  })

  superagent
  .post(url)
  .send(req.body)
  .end((error, response) => {
    if (!error && response) {
      debug('response:')
      debug(response.text)
      // if (options.length) {
      //   next()
      // } else {
        res.send({ status: 200, text: 'Create a new poll successfully.' })
      // }
    } else {
      const errWrapped = handlerError(error, response)
      res.status(errWrapped.status).send({
        status: errWrapped.status,
        text: errWrapped.text
      })
      console.error(`Error occurred during create a new poll : ${url}`)
      console.error(error) 
    }
    req.outcome = response
    next()
  })
})

router.put('/update', (req, res, next) => {  
  const url = `${apiHost}/v2/polls`
  debug('Got a poll updating call.')
  debug('req.body', req.body)

  const choices = get(req, 'body.choices', [])
  superagent
  .put(url)
  .send(req.body)
  .end((error, response) => {
    if (!error && response) {
      if (choices.length) {
        debug('choices.length', choices.length)
        next()
      } else {
        res.send({ status: 200, text: 'Updating a poll successfully.' })
      }      
    } else {
      const errWrapped = handlerError(error, response)
      res.status(errWrapped.status).send({
        status: errWrapped.status,
        text: errWrapped.text
      })
      trace({
        ip: req.clientIp,
        method: req.method,
        model: 'poll',
        payload: req.body,
        operator: req.user.id,
        response,
      })
      console.error(`Error occurred during updating poll: ${url}`)
      console.error(error) 
    }
  })
}, updateOptions)

router.get('/count', (req, res) => {
  const url = `${apiHost}/v2/polls`
  res.json({
    count: 99
  })
  // superagent
  // .get(url)
  // .end((error, response) => {
  //   if (!error && response) {
  //     debug('Fetch posts count from api successfully.')
  //     res.send(camelizeKeys(response.body))
  //   } else {
  //     const errWrapped = handlerError(error, response)
  //     res.status(errWrapped.status).send({
  //       status: errWrapped.status,
  //       text: errWrapped.text
  //     })
  //     console.error(`Error occurred during fetch data from : ${url}`)
  //     console.error(error) 
  //   }
  // })
})

router.delete('/', (req, res, next) => {
  debug('Got a post del call.')
  debug(req.body)
  const ids = get(req, 'body.ids', [])
  Promise.all(map(ids, id => new Promise(resolve => {
    // const url = `${apiHost}/v2/polls/${id}`
    const url = `${apiHost}/v2/polls`
    debug('POLL### DELETING poll:', id)

    superagent
    // .delete(url)
    .put(url)
    .send({
      id: numeral(id).value(),
      active: 0
    })
    .end((error, response) => {
      if (error) {
        console.error('Error occurred during deleting poll', id)
        console.error(error)     
      }
      resolve()
    })    
  }).catch(error => {
    console.error('Error occurred during deleting poll', id)
    console.error(error)    
  }))).then(() => {
    res.send({ status: 200, text: 'Done.' })
    req.outcome = { status: 200 }
    next()
  }).catch(err => {
    const errWrapped = handlerError(err)
    const outcome = { status: errWrapped.status, text: errWrapped.text }
    console.error(`Error occurred during deleting poll: ${ids}`)
    console.error(err)     
    res.status(errWrapped.status).send(outcome)
    req.outcome = outcome
    next()
  })
},)
module.exports = router
