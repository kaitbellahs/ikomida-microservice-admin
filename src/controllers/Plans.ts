import { DBModels, Domain, Logics, objHasProp, Types, Utils } from '@ikomida/shared-backend'

export default class Plans {
  randCodes
  logger
  limit = 10

  constructor(logger: Utils.Logger) {
    this.randCodes = new Utils.RandCodes()
    this.logger = logger
  }

  async getPlans(timestamp = 0) {
    try {
      const where =
        timestamp && timestamp != 0 && Number(Logics.Finances.toNumber(timestamp)) == timestamp
          ? {
            createdAt: {
              [Domain.SqlDB.Op.lt]: new Date(Number(Logics.Finances.toNumber(timestamp)))
            }
          }
          : null
      const planModels = await DBModels.PlanModel.findAll({
        order: [['createdAt', 'DESC']],
        limit: this.limit,
        where: {
          ...{},
          ...where
        }
      })
      const plans: Types.Classes.CPlan[] = planModels.map(planModel => {
        return Types.Classes.CPlan.init(
          planModel.name ?? '',
          planModel?.price ?? 0,
          planModel?.discount ?? 0,
          planModel?.discountType ?? Types.Types.TDiscount.NO,
          planModel?.staff ?? -1,
          planModel?.products ?? -1,
          planModel?.productOptions ?? -1,
          planModel?.categories ?? -1,
          planModel?.pushNotifications ?? -1,
          planModel?.orders ?? -1,
          planModel?.coupons ?? -1,
          planModel?.billing ?? -1,
          planModel?.details ?? [],
          planModel?.support ?? [],
          planModel?.highlighted ?? false,
          (planModel?.price ?? 0) -
          Logics.Finances.calcDiscount(
            planModel?.price ?? 0,
            planModel?.discount ?? 0,
            planModel?.discountType ?? Types.Types.TDiscount.NO
          ),
          planModel?.active,
          planModel?.createdAt,
          planModel?.order,
          planModel?.id,
          planModel?.createdAt.getTime()
        )
      })
      return new Utils.Return(
        true,
        plans?.sort(
          (item1: Types.Classes.CPlan, item2: Types.Classes.CPlan) =>
            (item2?.timestamp ?? 0 ?? 0) - (item1?.timestamp ?? 0 ?? 0)
        )
      )
    } catch (exception: any) {
      const error = new Utils.iKomidaError(
        Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_GET_PLANS_EXCEPTION,
        exception?.message
      )
      return error.logAndReturn(this.logger)
    }
  }

  async newPlan(input: any) {
    try {
      const object: Types.Classes.CPlan = Types.Classes.CPlan.fromObject(input)
      if (!object.validate() || !this.validateObject(object)) {
        const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_NEW_PLAN_MISSING_DATA)
        return error.logAndReturn(this.logger)
      }
      if (object.discount && !object.discountType) {
        const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_NEW_PLAN_DISCOUNT_TYPE)
        return error.logAndReturn(this.logger)
      }
      await DBModels.PlanModel.create({
        name: object.name,
        price: Logics.Finances.toFinanceNumber(object.price ?? 0),
        discount: Logics.Finances.toFinanceNumber(object.discount ?? 0),
        discountType: object.discountType,
        highlighted: object.highlighted,
        order: object.order,
        staff: object.staff,
        products: object.products,
        orders: object.orders,
        coupons: object.coupons,
        billing: Logics.Finances.toFinanceNumber(object.billing ?? 0),
        details: object.details,
        support: object.support
      })
      return new Utils.Return(true)
    } catch (exception: any) {
      const error = new Utils.iKomidaError(
        Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_NEW_PLAN_EXCEPTION,
        exception?.message
      )
      return error.logAndReturn(this.logger)
    }
  }

  async editPlan(input: any) {
    try {
      const object: Types.Classes.CPlan = Types.Classes.CPlan.fromObject(input)
      if (!this.validateObject(object)) {
        const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_EDIT_PLAN_MISSING_DATA)
        return error.logAndReturn(this.logger)
      }
      if (object.discount && !object.discountType) {
        const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_NEW_PLAN_DISCOUNT_TYPE)
        return error.logAndReturn(this.logger)
      }
      const plan = await DBModels.PlanModel.findOne({
        where: {
          id: object.id
        }
      })
      if (!plan) {
        const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_NEW_PLAN_DISCOUNT_TYPE)
        return error.logAndReturn(this.logger)
      }
      plan.name = object.name
      plan.price = Logics.Finances.toFinanceNumber(object.price ?? 0) ?? 0
      plan.discount = Logics.Finances.toFinanceNumber(object.discount ?? 0) ?? 0
      plan.discountType = object.discountType
      plan.highlighted = object.highlighted
      plan.order = object.order
      plan.staff = object.staff
      plan.products = object.products
      plan.orders = object.orders
      plan.coupons = object.coupons
      plan.billing = Logics.Finances.toFinanceNumber(object.billing ?? 0) ?? 0
      plan.support = object.support
      plan.details = object.details
      await plan.save()
      return new Utils.Return(true)
    } catch (exception: any) {
      const error = new Utils.iKomidaError(
        Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_EDIT_PLAN_EXCEPTION,
        exception?.message
      )
      return error.logAndReturn(this.logger)
    }
  }

  async removePlan(id: string) {
    try {
      //TODO: validate uuid id
      const plan = await DBModels.PlanModel.findOne({
        where: {
          id: id
        }
      })
      await plan?.destroy()
      return new Utils.Return(true)
    } catch (exception: any) {
      const error = new Utils.iKomidaError(
        Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_DELETE_PLAN_EXCEPTION,
        exception?.message
      )
      return error.logAndReturn(this.logger)
    }
  }

  validateObject(object: Types.Classes.CPlan) {
    return objHasProp(
      [
        'name',
        'price',
        'discount',
        'discountType',
        'order',
        'staff',
        'products',
        'orders',
        'billing',
        'details',
        'support'
      ],
      object
    )
  }
}
