import { BackendTypes, DBModels, Domain, Logics, Types, Utils } from '@ikomida/shared-backend';
import { WhereOptions } from 'sequelize';

export default class Apps {
  logger;
  limit = 10;

  constructor(logger: Utils.Logger) {
    this.logger = logger;
  }

  async getApps(identity: Types.Classes.CUser, timestamp = 0) {
    try {
      const role = BackendTypes.Roles.valueOf(identity.role);
      const where: WhereOptions =
        timestamp && timestamp != 0 && Number(Logics.Finances.toNumber(timestamp)) == timestamp
          ? {
              createdAt: {
                [Domain.SqlDB.Op.lt]: new Date(Number(Logics.Finances.toNumber(timestamp))),
              },
            }
          : {};
      const userModel: DBModels.UserModel | null = await DBModels.UserModel.findOne({
        where: {
          id: identity?.id,
          role,
        },
        include: {
          model: DBModels.AppModel,
          as: 'apps',
          required: false,
          order: [['createdAt', 'DESC']],
          limit: this.limit,
          where,
        },
      });
      const apps = userModel?.apps?.map((appModel: DBModels.AppModel) => {
        return Types.Classes.CApp.init(
          appModel?.bundleId ?? '',
          appModel?.displayName ?? '',
          appModel?.platform ?? '',
          undefined,
          appModel?.version,
          appModel?.storeStatus,
          appModel?.storePublishStatus,
          appModel?.active,
          appModel?.createdAt,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          appModel?.id,
          appModel?.createdAt.getTime(),
        );
      });
      return new Utils.Return(
        true,
        apps?.sort(
          (item1: Types.Classes.CApp, item2: Types.Classes.CApp) => (item2?.timestamp ?? 0) - (item1?.timestamp ?? 0),
        ),
      );
    } catch (exception: any) {
      const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_GET_PLANS_EXCEPTION, exception);
      return error.logAndReturn(this.logger);
    }
  }

  async getApp(identity: Types.Classes.CUser, id: string) {
    try {
      //TODO: --validate Id
      const role = BackendTypes.Roles.valueOf(identity.role);
      const userModel = await DBModels.UserModel.findOne({
        where: {
          id: identity?.id,
          role,
        },
        include: {
          model: DBModels.AppModel,
          required: false,
          where: {
            id,
          },
        },
      });
      const appModel = userModel?.apps?.[0];
      if (!appModel) {
        return new Utils.Return(false);
      }
      const app: Types.Classes.CApp = Types.Classes.CApp.fromObject({
        id: appModel?.id,
        bundleId: appModel?.bundleId,
        displayName: appModel?.displayName,
        platform: appModel?.platform,
        version: appModel?.version,
        fireBaseId: appModel?.fireBaseId,
        iOSProfileId: appModel?.iOSProfileId,
        storeStatus: appModel?.storeStatus,
        storeNote: appModel?.storeNote,
        storeEvidences: appModel?.storeEvidences,
        storeVersion: appModel?.storeVersion,
        storeBuildStatus: appModel?.storeBuildStatus,
        storePublishStatus: appModel?.storePublishStatus,
        active: appModel?.active,
        createdAt: appModel?.createdAt,
        timestamp: appModel?.createdAt.getTime(),
      });
      return new Utils.Return(true, app);
    } catch (exception: any) {
      const error = new Utils.iKomidaError(
        Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_GET_PLANS_EXCEPTION,
        exception?.message,
      );
      return error.logAndReturn(this.logger);
    }
  }

  async editApp(identity: Types.Classes.CUser, id: string, input: any) {
    try {
      //TODO: --validate Id
      const object: Types.Classes.CApp = Types.Classes.CApp.fromObject(input);
      const role = BackendTypes.Roles.valueOf(identity.role);
      const userModel = await DBModels.UserModel.findOne({
        where: {
          id: identity?.id,
          role,
        },
        include: {
          model: DBModels.AppModel,
          as: 'apps',
          required: false,
          where: {
            id,
          },
        },
      });
      const appModel = userModel?.apps?.[0];
      if (!appModel) {
        return new Utils.Return(false);
      }
      for (const key of Object.keys(object)) {
        if (key !== 'id' && key in appModel) {
          (appModel as any)[key] = (object as any)[key];
        }
      }
      await appModel.save();
      return new Utils.Return(true);
    } catch (exception: any) {
      const error = new Utils.iKomidaError(
        Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_GET_PLANS_EXCEPTION,
        exception?.message,
      );
      return error.logAndReturn(this.logger);
    }
  }
}
