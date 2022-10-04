import express from 'express'
import bodyParser from 'body-parser'
import Plans from './controllers/Plans.js'
import Statistics from './controllers/Statistics.js'
import Settings from './controllers/Settings.js'
import Terms from './controllers/Terms.js'
import Contracts from './controllers/Contracts.js'
import Apps from './controllers/Apps.js'
import { BackendTypes, Types, Utils } from '@ikomida/shared-backend'

import { createRequire } from 'module'
const require = createRequire(import.meta.url)
let { name } = require('../package.json')
name = name
  .replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
  .replace(/^\w/, (m: string) => m.toUpperCase())
  .replace(/-\w/g, (m: string[]) => m[1].toUpperCase())
const logger = Utils.Logger.getInstance(name)

const app = express()
app.disable('x-powered-by')
app.use(bodyParser.json({ limit: '10mb' }))
Utils.System.setExpressResponse(app)
const port = process?.env?.PORT ?? 80

const plans = new Plans(logger)
const statistics = new Statistics(logger)
const settings = new Settings(logger)
const terms = new Terms(logger)
const contracts = new Contracts(logger)
const apps = new Apps(logger)

//MARK: --Plans
app.post('/admin/plan', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || ![BackendTypes.Roles.MANAGER, BackendTypes.Roles.ADMIN].includes(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await plans.newPlan(Types.Classes.CPlan.fromObject(req.body))
  res.status(payload?.success ? 201 : 200).sendResponse(payload)
})

app.put('/admin/plan', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || ![BackendTypes.Roles.MANAGER, BackendTypes.Roles.ADMIN].includes(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await plans.editPlan(Types.Classes.CPlan.fromObject(req.body))
  res.status(payload?.success ? 201 : 200).sendResponse(payload)
})

app.delete('/admin/plan/:id', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || ![BackendTypes.Roles.MANAGER, BackendTypes.Roles.ADMIN].includes(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await plans.removePlan(req.params?.id)
  res.status(payload?.success ? 201 : 200).sendResponse(payload)
})

app.get('/admin/plans/:timestamp', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || ![BackendTypes.Roles.MARKETING, BackendTypes.Roles.MANAGER, BackendTypes.Roles.ADMIN].includes(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await plans.getPlans(Number(req.params?.timestamp) ?? 0)
  res.status(payload?.success ? 201 : 200).sendResponse(payload)
})

//MARK: --contracts
app.get('/admin/contracts/:timestamp', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || !BackendTypes.Roles.isInternal(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await contracts.getContracts(Number(req.params?.timestamp) ?? 0)
  res.status(payload?.success ? 201 : 200).sendResponse(payload)
})

app.get('/admin/contract/:id', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || !BackendTypes.Roles.isInternal(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await contracts.getContract(req.params?.id ?? 0)
  res.status(payload?.success ? 201 : 200).sendResponse(payload)
})

app.patch('/admin/contract/:id/app/:appId/associate', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || !BackendTypes.Roles.isInternal(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await contracts.associateContract(identity, req.params?.id ?? 0, req.params?.appId ?? 0)
  res.status(payload?.success ? 201 : 200).sendResponse(payload)
})

app.delete('/admin/contract/:id/app/:appId/associate', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || !BackendTypes.Roles.isInternal(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await contracts.unAssociateContract(identity, req.params?.id ?? 0, req.params?.appId ?? 0)
  res.status(payload?.success ? 201 : 200).sendResponse(payload)
})

//MARK: --Apps
app.get('/admin/apps/:timestamp', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || !BackendTypes.Roles.isInternal(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await apps.getApps(identity, Number(req.params?.timestamp) ?? 0)
  res.status(payload?.success ? 201 : 200).sendResponse(payload)
})

app.get('/admin/app/:id', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || !BackendTypes.Roles.isInternal(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await apps.getApp(identity, req.params?.id ?? 0)
  res.status(payload?.success ? 201 : 200).sendResponse(payload)
})

app.patch('/admin/app/:id', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || !BackendTypes.Roles.isInternal(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await apps.editApp(identity, req.params?.id ?? 0, req.body)
  res.status(payload?.success ? 201 : 200).sendResponse(payload)
})

//MARK: --Statistics
app.get('/admin/productsCount', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || ![BackendTypes.Roles.MARKETING, BackendTypes.Roles.MANAGER, BackendTypes.Roles.ADMIN].includes(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await statistics.countProducts()

  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.sendResponse(payload)
})
app.get('/admin/ordersCount', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || ![BackendTypes.Roles.MARKETING, BackendTypes.Roles.MANAGER, BackendTypes.Roles.ADMIN].includes(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await statistics.countOrders()
  res.sendResponse(payload)
})
app.get('/admin/resellersCount', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || ![BackendTypes.Roles.MARKETING, BackendTypes.Roles.MANAGER, BackendTypes.Roles.ADMIN].includes(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await statistics.countResellers()
  res.sendResponse(payload)
})
app.get('/admin/restaurantsCount', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || ![BackendTypes.Roles.MARKETING, BackendTypes.Roles.MANAGER, BackendTypes.Roles.ADMIN].includes(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await statistics.countRestaurants()
  res.sendResponse(payload)
})
app.get('/admin/usersCount', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || ![BackendTypes.Roles.MARKETING, BackendTypes.Roles.MANAGER, BackendTypes.Roles.ADMIN].includes(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await statistics.countUsers()
  res.sendResponse(payload)
})
app.get('/admin/couponsCount', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || ![BackendTypes.Roles.MARKETING, BackendTypes.Roles.MANAGER, BackendTypes.Roles.ADMIN].includes(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await statistics.countCoupons()
  res.sendResponse(payload)
})

//MAKR: -- Setting
app.get('/admin/settings/:timestamp', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || ![BackendTypes.Roles.MARKETING, BackendTypes.Roles.MANAGER, BackendTypes.Roles.ADMIN].includes(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await settings.getSettings(Number(req.params?.timestamp) ?? 0)
  res.sendResponse(payload)
})
app.post('/admin/setting', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || ![BackendTypes.Roles.MARKETING, BackendTypes.Roles.MANAGER, BackendTypes.Roles.ADMIN].includes(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await settings.newSetting(Types.Classes.CSetting.fromObject(req.body))
  res.sendResponse(payload)
})
app.put('/admin/activateSetting', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || ![BackendTypes.Roles.MARKETING, BackendTypes.Roles.MANAGER, BackendTypes.Roles.ADMIN].includes(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await settings.activeSetting(Types.Classes.CSetting.fromObject(req.body))
  res.sendResponse(payload)
})
app.put('/admin/setting', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || ![BackendTypes.Roles.MARKETING, BackendTypes.Roles.MANAGER, BackendTypes.Roles.ADMIN].includes(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await settings.editSetting(Types.Classes.CSetting.fromObject(req.body))
  res.sendResponse(payload)
})
app.delete('/admin/setting/:id', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || ![BackendTypes.Roles.MARKETING, BackendTypes.Roles.MANAGER, BackendTypes.Roles.ADMIN].includes(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await settings.removeSetting(req.params?.id)
  res.sendResponse(payload)
})
//MARK: -- Terms
app.get('/admin/terms/:timestamp', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || ![BackendTypes.Roles.MARKETING, BackendTypes.Roles.MANAGER, BackendTypes.Roles.ADMIN].includes(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await terms.getTerms(Number(req.params?.timestamp) ?? 0)
  res.sendResponse(payload)
})
app.post('/admin/term', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || ![BackendTypes.Roles.MARKETING, BackendTypes.Roles.MANAGER, BackendTypes.Roles.ADMIN].includes(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await terms.newTerm(req.body)
  res.sendResponse(payload)
})
app.put('/admin/activateTerm', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || ![BackendTypes.Roles.MARKETING, BackendTypes.Roles.MANAGER, BackendTypes.Roles.ADMIN].includes(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await terms.activeTerm(Types.Classes.CTerm.fromObject(req.body))
  res.sendResponse(payload)
})
app.put('/admin/term', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || ![BackendTypes.Roles.MARKETING, BackendTypes.Roles.MANAGER, BackendTypes.Roles.ADMIN].includes(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await terms.editTerm(Types.Classes.CTerm.fromObject(req.body))
  res.sendResponse(payload)
})
app.delete('/admin/term/:id', async (req, res) => {
  const identity: Types.Classes.CUser = Types.Classes.CUser.fromObject(req.headers?.identity)
  const role = BackendTypes.Roles.valueOf(identity.role)
  if (!role || ![BackendTypes.Roles.MARKETING, BackendTypes.Roles.MANAGER, BackendTypes.Roles.ADMIN].includes(role)) {
    const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_UNAUTHORIZED)
    return res.status(403).sendResponse(error.logAndReturn(logger))
  }
  const payload = await terms.removeTerm(req.params?.id)
  res.sendResponse(payload)
})

app.all('*', async (req, res) => {
  logger.error(`Admin endpoint "${req?.url}" not found:`)
  res.status(404).sendResponse({ error: 'NOT FOUND' })
})

app.listen(port, () => {
  logger.info(`${name} listening at http://localhost:${port}`)
})
