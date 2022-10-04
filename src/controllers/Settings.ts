import { Domain, Utils, Logics, DBModels, Types, objHasProp } from '@ikomida/shared-backend';

export default class Settings {
  logger;
  limit = 10;

  constructor(logger: Utils.Logger) {
    this.logger = logger;
  }

  async getSettings(timestamp = 0) {
    try {
      const where =
        timestamp && timestamp != 0 && Number(Logics.Finances.toNumber(timestamp)) == timestamp
          ? {
              createdAt: {
                [Domain.SqlDB.Op.lt]: new Date(Number(Logics.Finances.toNumber(timestamp))),
              },
            }
          : {};
      const settingModels = await DBModels.SettingModel.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: this.limit,
      });
      const settings = settingModels.map((settingModel) => {
        return Types.Classes.CSetting.init(
          settingModel.name ?? '',
          settingModel.value ?? '',
          settingModel.type ?? Types.Types.TSetting.TEXT,
          settingModel.active ?? false,
          settingModel.createdAt,
          settingModel.id,
          settingModel.createdAt.getTime(),
        );
      });
      return new Utils.Return(
        true,
        settings?.sort((item1, item2) => (item2.timestamp ?? 0) - (item1.timestamp ?? 0)),
      );
    } catch (exception: any) {
      const error = new Utils.iKomidaError(
        Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_GET_SETTINGS_EXCEPTION,
        exception?.message,
      );
      return error.logAndReturn(this.logger);
    }
  }

  async newSetting(input: any) {
    try {
      const object: Types.Classes.CSetting = Types.Classes.CSetting.fromObject(input);
      if (object.validate() || !this.validateObject(object)) {
        const error = new Utils.iKomidaError(Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_NEW_SETTING_MISSING_DATA);
        return error.logAndReturn(this.logger);
      }
      await DBModels.SettingModel.create({
        name: object?.name,
        value: object?.value,
        type: object?.type,
        active: object?.active,
      });
      return new Utils.Return(true);
    } catch (exception: any) {
      const error = new Utils.iKomidaError(
        Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_NEW_SETTING_EXCEPTION,
        exception?.message,
      );
      return error.logAndReturn(this.logger);
    }
  }

  async removeSetting(id: string) {
    try {
      //TODO: validate uuid id
      const setting = await DBModels.SettingModel.findOne({
        where: {
          id: id,
        },
      });
      await setting?.destroy();
      return new Utils.Return(true);
    } catch (exception: any) {
      const error = new Utils.iKomidaError(
        Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_DELETE_SETTING_EXCEPTION,
        exception?.message,
      );
      return error.logAndReturn(this.logger);
    }
  }

  async editSetting(input: any) {
    try {
      const object: Types.Classes.CSetting = Types.Classes.CSetting.fromObject(input);
      const setting = await DBModels.SettingModel.findOne({
        where: {
          id: object?.id,
        },
      });
      if (setting) {
        setting.name = object?.name;
        setting.value = object?.value;
        setting.type = object?.type;
        await setting.save();
      }
      return new Utils.Return(true);
    } catch (exception: any) {
      const error = new Utils.iKomidaError(
        Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_EDIT_SETTING_EXCEPTION,
        exception?.message,
      );
      return error.logAndReturn(this.logger);
    }
  }

  async activeSetting(input: any) {
    try {
      const object: Types.Classes.CSetting = Types.Classes.CSetting.fromObject(input);
      const setting = await DBModels.SettingModel.findOne({
        where: {
          id: object?.id,
        },
      });
      if (object?.active) {
        await setting?.destroy();
      } else {
        await setting?.restore();
      }
      // await setting?.save()
      return new Utils.Return(true);
    } catch (exception: any) {
      const error = new Utils.iKomidaError(
        Utils.iKomidaError.IKOMIDA_ADMIN_SERVICE_ACTIVE_SETTING_EXCEPTION,
        exception?.message,
      );
      return error.logAndReturn(this.logger);
    }
  }

  validateObject(object: Types.Classes.CSetting) {
    return objHasProp(['name', 'value', 'type'], object);
  }
}
