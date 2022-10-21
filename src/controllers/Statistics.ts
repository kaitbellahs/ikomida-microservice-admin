import { BackendTypes, DBModels, Domain, Utils } from '@ikomida/shared-backend'

export default class Statistics {
  logger

  constructor(logger: Utils.Logger) {
    this.logger = logger
  }

  async countProducts() {
    try {
      return new Utils.Return(true, await DBModels.ProductModel.count())
    } catch (exception: any) {
      const error = new Utils.iKomidaError(
        Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_COUNT_PRODUCTS_EXCEPTION,
        exception?.message
      )
      return error.logAndReturn(this.logger)
    }
  }
  async countOrders() {
    try {
      return new Utils.Return(true, await DBModels.OrderModel.count())
    } catch (exception: any) {
      const error = new Utils.iKomidaError(
        Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_COUNT_ORDERS_EXCEPTION,
        exception?.message
      )
      return error.logAndReturn(this.logger)
    }
  }
  async countResellers() {
    try {
      return new Utils.Return(true, await DBModels.UserModel.count({ where: { role: BackendTypes.Roles.RESELLER } }))
    } catch (exception: any) {
      const error = new Utils.iKomidaError(
        Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_COUNT_RESELLERS_EXCEPTION,
        exception?.message
      )
      return error.logAndReturn(this.logger)
    }
  }
  async countUsers() {
    try {
      return new Utils.Return(true, await DBModels.UserModel.count({ where: { role: BackendTypes.Roles.CLIENT } }))
    } catch (exception: any) {
      const error = new Utils.iKomidaError(
        Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_COUNT_USERS_EXCEPTION,
        exception?.message
      )
      return error.logAndReturn(this.logger)
    }
  }
  async countRestaurants() {
    try {
      return new Utils.Return(true, await DBModels.ContractModel.count())
    } catch (exception: any) {
      const error = new Utils.iKomidaError(
        Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_COUNT_RESTAURANTS_EXCEPTION,
        exception?.message
      )
      return error.logAndReturn(this.logger)
    }
  }
  async countCoupons() {
    try {
      return new Utils.Return(true, await DBModels.CouponModel.count())
    } catch (exception: any) {
      const error = new Utils.iKomidaError(
        Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_COUNT_COUPONS_EXCEPTION,
        exception?.message
      )
      return error.logAndReturn(this.logger)
    }
  }
}
