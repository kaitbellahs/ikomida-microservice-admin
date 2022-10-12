import { BackendTypes, DBModels, Domain, Logics, Types, Utils } from '@ikomida/shared-backend'

export default class Contracts {
  logger
  limit = 10

  constructor(logger: Utils.Logger) {
    this.logger = logger
  }

  async getContracts(timestamp = 0) {
    try {
      const where =
        timestamp && timestamp != 0 && Number(Logics.Finances.toNumber(timestamp)) == timestamp
          ? {
              createdAt: {
                [Domain.SqlDB.Op.lt]: new Date(Number(Logics.Finances.toNumber(timestamp)))
              }
            }
          : {}
      const contractModels: DBModels.ContractModel[] | null = await DBModels.ContractModel.findAll({
        order: [['createdAt', 'DESC']],
        limit: this.limit,
        where,
        include: [
          {
            model: DBModels.PlanModel,
            required: true
          },
          {
            model: DBModels.AppModel,
            required: false,
            include: [
              {
                model: DBModels.UserModel,
                as: 'managedBy',
                required: false
              }
            ]
          }
        ]
      })
      const contracts: Types.Classes.CContract[] | null = contractModels.map(
        (contractModel: DBModels.ContractModel) => {
          const contract: Types.Classes.CContract = Types.Classes.CContract.fromObject({
            id: contractModel?.id,
            ikomidaID: contractModel?.ikomidaID,
            contractName: contractModel?.contractName,
            status: contractModel?.status,
            plan: {
              id: contractModel?.plan?.id,
              name: contractModel?.plan?.name ?? '-'
            },
            apps: [],
            createdAt: contractModel?.createdAt,
            timestamp: contractModel?.createdAt.getTime()
          })
          for (const appModel of contractModel?.apps ?? []) {
            const app: Types.Classes.CApp = Types.Classes.CApp.fromObject({
              id: appModel?.id,
              platform: appModel?.platform,
              storeStatus: appModel?.storeStatus,
              storePublishStatus: appModel?.storePublishStatus,
              managedBy: {
                id: appModel?.user?.id ?? '-',
                name: appModel?.user?.name ?? '-'
              }
            })
            contract?.apps?.push(app)
          }
          return contract
        }
      )
      return new Utils.Return(
        true,
        contracts?.sort(
          (item1: Types.Classes.CContract, item2: Types.Classes.CContract) =>
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

  async getContract(id: string) {
    try {
      //TODO: --validate Id
      const contractModel = await DBModels.ContractModel.findOne({
        where: {
          id
        },
        include: [
          {
            model: DBModels.PlanModel,
            required: true
          },
          {
            model: DBModels.AppModel,
            required: false,
            include: [
              {
                model: DBModels.UserModel,
                as: 'managedBy',
                required: false
              }
            ]
          }
        ]
      })
      const contract: Types.Classes.CContract = Types.Classes.CContract.init(
        contractModel?.ikomidaID ?? '',
        contractModel?.contractName ?? '',
        contractModel?.name ?? '',
        contractModel?.lastName ?? '',
        contractModel?.contractIdentity ?? '',
        contractModel?.email ?? '',
        contractModel?.phone ?? '',
        contractModel?.areaCode ?? 0,
        Types.Classes.CPlan.init(
          contractModel?.plan?.name ?? '',
          contractModel?.plan?.price ?? 0,
          contractModel?.plan?.discount ?? 0,
          contractModel?.plan?.discountType ?? Types.Types.TDiscount.NO,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          contractModel?.plan?.active,
          contractModel?.plan?.createdAt,
          contractModel?.plan?.order,
          contractModel?.plan?.id
        ),
        undefined,
        contractModel?.status?.id,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        contractModel?.createdAt,
        contractModel?.id,
        contractModel?.createdAt.getTime()
      )
      for (const appModel of contractModel?.apps ?? []) {
        const app: Types.Classes.CApp = Types.Classes.CApp.init(
          appModel?.bundleId ?? '',
          appModel?.displayName ?? '',
          appModel?.platform ?? '',
          undefined,
          appModel?.version,
          appModel?.storeStatus,
          appModel?.storePublishStatus,
          undefined,
          undefined,
          undefined,
          appModel?.storeNote,
          appModel?.storeEvidences,
          appModel?.storeVersion,
          appModel?.storeBuildStatus,
          Types.Classes.CUser.init(
            appModel?.user?.role?.id ?? '',
            appModel?.user?.name ?? '',
            appModel?.user?.lastName ?? '',
            '',
            appModel?.user?.email ?? '',
            appModel?.user?.phone ?? '',
            String(appModel?.user?.areaCode ?? ''),
            '',
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            appModel.user?.avatar,
            undefined,
            undefined,
            undefined,
            appModel.user?.id
          ),
          appModel?.id
        )
        contract?.apps?.push(app)
      }
      return new Utils.Return(true, contract)
    } catch (exception: any) {
      const error = new Utils.iKomidaError(
        Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_GET_PLANS_EXCEPTION,
        exception?.message
      )
      return error.logAndReturn(this.logger)
    }
  }

  async associateContract(identity: Types.Classes.CUser, id: string, appId: string) {
    try {
      //TODO: --validate Ids
      const role = BackendTypes.Roles.valueOf(identity.role)
      const contractModel = await DBModels.ContractModel.findOne({
        where: {
          id
        },
        include: {
          model: DBModels.AppModel,
          required: true,
          where: {
            id: appId
          }
        }
      })
      const userModel = await DBModels.UserModel.findOne({
        where: {
          id: identity?.id,
          role
        }
      })
      const appModel = contractModel?.apps?.[0]
      if (appModel && userModel) {
        await userModel.$add('app', appModel)
        appModel.storeStatus = 'PENDING'
        await appModel?.save()
      }
      return new Utils.Return(true, {
        id: userModel?.id,
        name: userModel?.name
      })
    } catch (exception: any) {
      const error = new Utils.iKomidaError(
        Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_GET_PLANS_EXCEPTION,
        exception?.message
      )
      return error.logAndReturn(this.logger)
    }
  }

  async unAssociateContract(identity: Types.Classes.CUser, id: string, appId: string) {
    try {
      //TODO: --validate Ids
      const role = BackendTypes.Roles.valueOf(identity.role)
      const contractModel = await DBModels.ContractModel.findOne({
        where: {
          id
        },
        include: {
          model: DBModels.AppModel,
          required: true,
          where: {
            id: appId
          },
          include: [
            {
              model: DBModels.UserModel,
              required: true,
              where: {
                id: identity?.id,
                role
              }
            }
          ]
        }
      })
      const appModel = contractModel?.apps?.[0]
      const userModel = contractModel?.apps?.[0]?.user
      if (appModel && userModel) {
        await userModel?.$remove('app', appModel)
      }
      return new Utils.Return(true, {})
    } catch (exception: any) {
      const error = new Utils.iKomidaError(
        Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_GET_PLANS_EXCEPTION,
        exception?.message
      )
      return error.logAndReturn(this.logger)
    }
  }
}
